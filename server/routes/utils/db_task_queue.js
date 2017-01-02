/**
 * Created by lnk on 2016/9/20.
 */
const EventEmitter = require('events');
const Promise = require('bluebird');

/**
 * 待执行的任务
 */
class DbTask extends EventEmitter {
    /**
     * @param {string} queueId 所在队列的id
     * @param {string} name 任务名，查bug时用
     * @param {Function} taskFunc 任务体，会排队运行
     * @param {number} timeout 超时时间
     * @param {boolean} showLog 是否打印日志
     */
    constructor(queueId, name, taskFunc, timeout, showLog) {
        super();
        this.queueId = queueId;
        this.name = name;
        this.taskFunc = taskFunc;
        this.timeout = timeout;
        this.showLog = showLog;

        /** 超时定时器 */
        this.timer = null;
        /** 是否已结束运行 */
        this.finished = false;
        /** 是否取消该任务的执行 */
        this.cancel = false;
        /** 下一个关联任务。当前任务失败时，后面的关联任务会被跳过执行 */
        this.nextSibling = null;
        /** 上一个task成功运行后返回的数据 */
        this.lastResult = null;
    }

    /**
     * 运行任务
     */
    run() {
        if (this.showLog) {
            console.log(`Task ${this.name} run`);
        }
        this.setTaskTimeout();
        try {
            const promise = this.taskFunc(this.lastResult);
            if (isPromise(promise)) {
                promise.then(this.onFinish.bind(this), this.onFail.bind(this));
            } else {
                // 允许不返回东西的情况。比如B任务依赖A任务运行，当发现A任务异常时B任务就可能什么都不执行
                // 但为防止忘记写return，还是打印一个错误日志出来
                if (promise === undefined) {
                    console.warn(`Task ${this.name} has not return`);
                }
                this.onFinish(promise);
            }
        } catch (error) {
            this.onFail(error);
        }
    }

    /**
     * 运行任务完成事件，会通知运行完成监听器
     * @param {object} [result] 任务运行结果
     */
    onFinish(result) {
        if (this.showLog) {
            console.log(`Task ${this.name} finished${this.isFinish ? '. But it\'s late' : ''}`);
        }
        if (!this.isFinish) {
            this.clearTaskTimeout();
            this.isFinish = true;
            this.emit(DbTask.EVENT_FINISH, result);
        }
    }

    /**
     * 运行任务失败事件，会通知运行失败监听器
     * @param {Error} error 任务运行结果
     */
    onFail(error) {
        if (this.showLog) {
            console.log(`Task ${this.name} failed`);
            console.error(error);
        }
        if (!this.isFinish) {
            this.clearTaskTimeout();
            this.isFinish = true;
            this.emit(DbTask.EVENT_FAIL, error);
        }
    }

    /**
     * 设置任务超时定时器
     */
    setTaskTimeout() {
        if (!this.timeout) {
            return;
        }

        this.timer = setTimeout(() => {
            this.onFail(new MError(MError.DB_TASK_QUEUE_TIME_OUT, `Task ${this.name} in queue ${this.queueId} is timeout`));
        }, this.timeout);
    }

    /**
     * 清除任务超时定时器
     */
    clearTaskTimeout() {
        if (!this.timer) {
            return;
        }

        clearTimeout(this.timer);
        this.timer = null;
    }
}
DbTask.EVENT_FINISH = 'finish';
DbTask.EVENT_FAIL = 'fail';

function isPromise(obj) {
    return obj && typeof obj.then === 'function';
}

/**
 * 任务队列
 */
class DbTaskQueue extends Array {
    /**
     * @param {string} id 队列id
     * @param {number} maxSize 队列中的最大任务数
     * @param {boolean} showLog 是否打印日志
     */
    constructor(id, maxSize, showLog) {
        super();
        this.id = id;
        this.maxSize = maxSize;
        this.showLog = showLog;
        this.isBusy = false;
    }

    /**
     * 若队列空闲，则运行下一个任务
     * @return {boolean} 是否成功运行了下一个任务
     */
    runNext() {
        if (this.showLog) {
            console.log(`queue ${this.id} is ${this.isBusy ? 'busy' : 'idle'}. length:${this.length}`);
        }
        if (this.isBusy || !this.length) {
            return false;
        }

        let task;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // 直接移出队列
            task = this.shift();
            if (!task) {
                return false;
            } else if (!task.cancel) {
                break;
            } else if (this.showLog) {
                console.log(`Task ${task.name} canceled`);
            }
        }
        this.isBusy = true;
        task.run();
        return true;
    }

    /**
     * 向队列中插入一个任务，若队列空闲，则运行它
     * @param {DbTask} task
     * @return {boolean} 是否成功运行了下一个任务
     */
    push(task) {
        if (this.showLog) {
            console.log(`queue ${this.id} push`);
        }
        task.prependListener(DbTask.EVENT_FINISH, (result) => {
            if (task.nextSibling) {
                task.nextSibling.lastResult = result;
            }
            this.finishTask();
        });
        task.prependListener(DbTask.EVENT_FAIL, () => {
            // 跳过后面的关联任务
            while (task.nextSibling) {
                task.nextSibling.cancel = true;
                task = task.nextSibling;
            }
            this.finishTask()
        });
        // TODO 超过maxSize时的处理
        super.push(task);
        return this.runNext();
    }

    /**
     * 完成当前任务时移除它，并运行下一个任务
     * @return {boolean} 是否成功运行了下一个任务
     */
    finishTask() {
        this.isBusy = false;
        return this.runNext();
    }
}

/**
 * 任务队列的集合
 */
class DbTaskQueueManager {
    /**
     * @param {boolean} [showLog = false] 是否打印日志
     */
    constructor(showLog = false) {
        this.queueMap = {};
        this.showLog = showLog;
    }

    /**
     * 创建或获取任务队列
     * @param {string} id 队列id
     * @param {number} [maxSize = 100] 队列中的最大任务数
     * @return {DbTaskQueue}
     */
    createDbTaskQueue(id, maxSize = 100) {
        let queue = this.queueMap[id];
        if (!queue) {
            queue = new DbTaskQueue(id, maxSize, this.showLog);
            this.queueMap[id] = queue;
        }
        return queue;
    }

    /**
     * task任务体方法
     * @callback taskFunc
     * @param {*|null} lastTaskResult 上一个任务体执行完成时在promise中返回的数据
     * @return {Promise} 通过此promise获取任务运行完成时机，也可以在此promise中返回查询到的数据等，会被传下一个taskFunc
     */
    /**
     * 创建一个任务，并将其放入队列运行。这个任务应该只进行一次数据库读写
     * @param {string} queueId 所在队列的id
     * @param {string} name 任务名，查bug时用
     * @param {taskFunc[]} taskFuncs 任务体数组，会排队运行。如果有一个任务失败了，就会跳过剩余的任务
     * @param {number} [timeout = 8000] 超时时间
     * @return {Promise} 该任务运行完成时的回调，会在队列外运行
     */
    pushTasks(queueId, name, taskFuncs, timeout = 8000) {
        const queue = this.createDbTaskQueue(queueId);
        const tasks = taskFuncs.map((taskFunc, i) => new DbTask(queueId, name + i, taskFunc, timeout, this.showLog))
        for (let i = 0; i < tasks.length - 1; i++) {
            tasks[i].nextSibling = tasks[i + 1];
        }

        return new Promise((resolve, reject) => {
            tasks[tasks.length - 1].on(DbTask.EVENT_FINISH, resolve);
            tasks.forEach((task) => {
                task.on(DbTask.EVENT_FAIL, reject);
                queue.push(task);
            });
        });
    }
}

module.exports = DbTaskQueueManager;
