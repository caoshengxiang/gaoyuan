<template>
    <div class="remodal"
         :class="{'big-mode':config.bigMode}"
         data-remodal-options="hashTracking: false"
         :data-remodal-id="config.remodalId">
        <div
            :class="{loading:config.isLoading, 'no-title':!config.title, 'no-ok':!config.hasOkBtn, 'no-cancel':!config.hasCancelBtn}">
            <button data-remodal-action="close" class="remodal-close" v-show="config.hasCloseBtn"></button>
            <h2 class="remodal-title">{{config.title}}</h2>
            <slot>
                <div class="content">
                    <div class="spinner">
                        <div class="spinner-containers">
                            <div class="spinner-container container1">
                                <div class="circle1"></div>
                                <div class="circle2"></div>
                                <div class="circle3"></div>
                                <div class="circle4"></div>
                            </div>
                            <div class="spinner-container container2">
                                <div class="circle1"></div>
                                <div class="circle2"></div>
                                <div class="circle3"></div>
                                <div class="circle4"></div>
                            </div>
                            <div class="spinner-container container3">
                                <div class="circle1"></div>
                                <div class="circle2"></div>
                                <div class="circle3"></div>
                                <div class="circle4"></div>
                            </div>
                        </div>
                    </div>
                    <div :class="{'remodal-content':config.msg}" v-show="safeHtml" v-html="safeHtml"></div>
                </div>
                <button data-remodal-action="cancel" class="remodal-cancel">{{config.cancelText||'取消'}}</button>
                <button data-remodal-action="confirm" class="remodal-confirm">{{config.confirmText||'确定'}}</button>
            </slot>
        </div>
    </div>
</template>

/*********************************************/

<script type="text/babel">
    /**
     * 使用方法：
     * 1.在template中加一个<remodal ref="remodal"></remodal>标签，并注册子组件
     * 2.弹框时，如果用了justXXX()方法，则update必须在justXXX()方法后面，否则无效
     * 3.onConfirm等方法必须在show/open之前调用，否则会出现异常
     * 4.即使弹框已经显示出来，在update或justXXX后面还是需要加上show()，否则onConfirm等回调会异常
     *
     * 遗留问题：
     * 1.openTimer等变量保存在vue实例中的，所以当一个页面有多个弹框实例时，无法在一个实例关闭动画完成前阻止另一个实例打开。快速开关不同实例弹框时，它们内部的状态可能会有些混乱
     * 2.依赖库remodal最终使用的是同一个dom，所以无法同时显示两个弹框
     */

    import 'remodal';
    import $ from 'jquery';

    // 用来生成不同弹框实例的事件命名空间的全局变量
    window.REMODAL_NAMESPACE_BASE = 1;
    // 相同id的remodal应该只有一个实例，用来解决多次初始化产生了多个dom的问题
    const remodalMap = {};

    export default {
        props: {
            // 对话框的唯一id
            remodalId: {
                type: String,
                default: 'remodal'
            },
            // 对话框标题，可以不填
            title: {
                type: String,
            },
            // 对话框内容
            msg: {
                type: String
            },
            // html代码形式的对话框内容，msg没填的话才会使用这个参数中的值
            contentHTML: {
                type: String,
            },
            // 确认按钮文字
            confirmText: {
                type: String,
                default: '确定'
            },
            // 取消按钮文字
            cancelText: {
                type: String,
                default: '取消'
            },
            // 显示loading转圈
            isLoading: {
                type: Boolean,
                default: false
            },
            // 是否显示确定按钮，若不显示，则取消按钮居中
            hasOkBtn: {
                type: Boolean,
                default: true
            },
            // 是否显示取消按钮，若不显示，则确定按钮居中
            hasCancelBtn: {
                type: Boolean,
                default: true
            },
            // 是否显示右上角的关闭按钮
            hasCloseBtn: {
                type: Boolean,
                default: false
            },
            // 是否在点确定时关闭对话框
            closeOnConfirm: {
                type: Boolean,
                default: true
            },
            // 是否在按ESC或点击外部区域时关闭对话框
            closeOnOutsideClick: {
                type: Boolean,
                default: true
            },
            // 是否是大型对话框的样式
            bigMode: {
                type: Boolean,
                default: false
            },
            // 是否在离开页面时销毁弹框
            destoryWhenLeavePage: {
                type: Boolean,
                default: false
            }
        },
        data() {
            const dataObj = {
                // 对话框的remodal实例
                remodal: null,
                // 显示的次数，用来分隔事件命名空间。
                showTimes: window.REMODAL_NAMESPACE_BASE,
                closeTimer: null,
                openTimer: null,
                config: {
                    remodalId: this.remodalId,
                    title: this.title,
                    msg: this.msg,
                    contentHTML: this.contentHTML,
                    confirmText: this.confirmText,
                    cancelText: this.cancelText,
                    isLoading: this.isLoading,
                    hasOkBtn: this.hasOkBtn,
                    hasCancelBtn: this.hasCancelBtn,
                    hasCloseBtn: this.hasCloseBtn,
                    closeOnConfirm: this.closeOnConfirm,
                    closeOnOutsideClick: this.closeOnOutsideClick,
                    bigMode: this.bigMode,
                    destoryWhenLeavePage: this.destoryWhenLeavePage,
                },
            }
            window.REMODAL_NAMESPACE_BASE += 1000000;
            return dataObj;
        },
        computed: {
            safeHtml() {
                if (this.config.msg) {
                    return this.config.msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/(\r\n|\n)/g, '<br>');
                } else if (this.config.contentHTML) {
                    return this.config.contentHTML;
                } else {
                    return null;
                }
            }
        },
        methods: {
            update,
            justLoading,
            justTips,
            justConfirm,
            justBlank,
            setContentHTML,
            // 设置用户点击确定时的回调方法，只会回调一次。用法：xxxDlg.onConfirm(function(){console.log('confirm clicked!')})
            onConfirm(callback) {
                addEventListener(this, 'confirmation', callback);
                return this;
            },
            // 不包括点x和点外部overlay关闭对话框的情况
            onCancel(callback) {
                addEventListener(this, 'cancellation', callback);
                return this;
            },
            onOpened(callback) {
                addEventListener(this, 'opened', callback);
                return this;
            },
            onClosed(callback) {
                addEventListener(this, 'closed', callback);
                return this;
            },
            onOpening(callback) {
                addEventListener(this, 'opening', callback);
                return this;
            },
            onClosing(callback) {
                addEventListener(this, 'closing', callback);
                return this;
            },
            removeEventListener(...args) {
                removeEventListener(this, ...args);
                return this;
            },
            /** 显示弹窗 */
            show: open,
            /** 显示弹窗 */
            open,
            /** 关闭弹窗 */
            close,
            destory,
        },
        watch: {
            'config.closeOnConfirm': function configCloseOnConfirm(newValue) {
                this.remodal.settings.closeOnConfirm = newValue;
            },
            'config.closeOnOutsideClick': function configCloseOnOutsideClick(newValue) {
                this.remodal.settings.closeOnOutsideClick = newValue;
            },
            'config.closeOnEscape': function configCloseOnEscape(newValue) {
                this.remodal.settings.closeOnEscape = newValue;
            },
            // 对话框标题，可以不填
            title(newValue) {
                this.config.title = newValue;
            },
            // 对话框内容
            msg(newValue) {
                this.config.msg = newValue;
            },
            // html代码形式的对话框内容，msg没填的话才会使用这个参数中的值
            contentHTML(newValue) {
                this.config.contentHTML = newValue;
            },
            // 确认按钮文字
            confirmText(newValue) {
                this.config.confirmText = newValue;
            },
            // 取消按钮文字
            cancelText(newValue) {
                this.config.cancelText = newValue;
            },
            // 显示loading转圈
            isLoading(newValue) {
                this.config.isLoading = newValue;
            },
            // 是否显示确定按钮，若不显示，则取消按钮居中
            hasOkBtn(newValue) {
                this.config.hasOkBtn = newValue;
            },
            // 是否显示取消按钮，若不显示，则确定按钮居中
            hasCancelBtn(newValue) {
                this.config.hasCancelBtn = newValue;
            },
            // 是否显示右上角的关闭按钮
            hasCloseBtn(newValue) {
                this.config.hasCloseBtn = newValue;
            },
            // 是否在点确定时关闭对话框
            closeOnConfirm(newValue) {
                this.config.closeOnConfirm = newValue;
            },
            // 是否在按ESC或点击外部区域时关闭对话框
            closeOnOutsideClick(newValue) {
                this.config.closeOnOutsideClick = newValue;
            },
            // 是否是大型对话框的样式
            bigMode(newValue) {
                this.config.bigMode = newValue;
            },
            // 是否在离开页面时销毁弹框
            destoryWhenLeavePage(newValue) {
                this.config.destoryWhenLeavePage = newValue;
            },
        },
        mounted() {
            this.$nextTick(() => {
                const existRemodal = remodalMap[this.config.remodalId];
                // 销毁之前打开过的同一个id的对话框。解决多次展示同一个页面时的重复初始化问题
                if (existRemodal) {
                    existRemodal.destroy();
                }
                this.remodal = $(`[data-remodal-id=${this.config.remodalId}]`).remodal({hashTracking: false});
                remodalMap[this.config.remodalId] = this.remodal;
            })
        },
    }

    /**
     * 更新对话框的样式。可以在对话框展示前和展示时调用
     * @param {object, optional} newConfig
     */
    function update(newConfig) {
        if (!newConfig) {
            return this;
        }
        for (const key in newConfig) {
            if (newConfig.hasOwnProperty(key)) {
                this.config[key] = newConfig[key];
            }
        }
        return this;
    }

    /**
     * 将对话框设置为只有loading的样式
     */
    function justLoading() {
        return this.update({
            title: null,
            msg: null,
            contentHTML: null,
            isLoading: true,
            hasOkBtn: false,
            hasCancelBtn: false,
            hasCloseBtn: false,
            closeOnOutsideClick: false,
            bigMode: false,
        });
    }

    /**
     * 将对话框设置为只有一个按钮的提示框样式
     * @param {string} msg
     * @param {string, optional} title 不填则为“提示”
     * @param {string, optional} confirmText 不填则为“确定”
     */
    function justTips(msg, title, confirmText) {
        return this.update({
            title: title || '提示',
            msg,
            contentHTML: null,
            confirmText: confirmText || '确定',
            isLoading: false,
            hasOkBtn: true,
            hasCancelBtn: false,
            hasCloseBtn: false,
            closeOnOutsideClick: true,
            closeOnConfirm: true,
            bigMode: false,
        });
    }

    /**
     * 将对话框设置为有确定和取消按钮的提示框样式
     * @param {string} msg
     * @param {string, optional} title 不填则为“提示”
     * @param {string, optional} confirmText 不填则为“确定”
     * @param {string, optional} cancelText 不填则为“取消”
     */
    function justConfirm(msg, title, confirmText, cancelText) {
        return this.update({
            title: title || '提示',
            msg,
            contentHTML: null,
            confirmText: confirmText || '确定',
            cancelText: cancelText || '取消',
            isLoading: false,
            hasOkBtn: true,
            hasCancelBtn: true,
            hasCloseBtn: false,
            closeOnConfirm: true,
            bigMode: false,
        });
    }

    /**
     * 清空对话框上的所有元素，随后应该使用update添加自己想要的东西
     */
    function justBlank() {
        return this.update({
            title: null,
            msg: null,
            contentHTML: null,
            confirmText: false,
            cancelText: false,
            isLoading: false,
            hasOkBtn: false,
            hasCancelBtn: false,
            hasCloseBtn: false,
            closeOnConfirm: true,
            bigMode: false,
        });
    }

    /**
     * 设置对话框内容html代码
     * @param {string} html
     */
    function setContentHTML(html) {
        return this.update({
            msg: null,
            contentHTML: html
        });
    }

    /**
     * 解决open动画结束前调用close无效的问题。并且清空本次生命周期添加的事件监听
     */
    function close() {
        const state = this.remodal.getState();
        if (state === 'opening') {
            this.closeTimer = setTimeout(close.bind(this), 50);
        } else if (state === 'opened') {
            this.remodal.close();
        } else if (state === 'closing' && this.openTimer) {
            // 上个close动画还未结束，并且有open事件正在等待时，又来了close事件，就将open事件取消，close事件也直接跳过
            clearTimeout(this.openTimer);
            this.openTimer = null;
        }
        return this;
    }

    /**
     * 解决close动画结束前调用open无效的问题
     */
    function open() {
        // console.log('state: ', this.remodal.getState());
        const state = this.remodal.getState();
        if (state === 'closing') {
            this.openTimer = setTimeout(open.bind(this), 50);
        } else if (state === 'closed') {
            $(this.remodal.$modal).off(`.remodal_${this.showTimes - 1}`);
            this.showTimes++
            this.remodal.open();
        } else if (state === 'opening' && this.closeTimer) {
            // 上个open动画还未结束，并且有close事件正在等待时，又来了open事件，就将close事件取消，open事件也直接跳过
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }
        return this;
    }

    /**
     * 销毁弹框
     */
    function destory() {
        this.remodal.destory();
    }

    /**
     * 添加事件监听器，只响应一次。必须在show方法之前调用
     */
    function addEventListener(vm, eventName, callback) {
        if (eventName && callback) {
            // console.log('add', eventName + '.remodal_' + vm.showTimes)
            $(vm.remodal.$modal).one(`${eventName}.remodal_${vm.showTimes}`, callback);
        }
        return vm;
    }

    /**
     * 删除上次一show过程中添加的事件监听器。若callback为空就删除所有该事件的监听器
     */
    function removeEventListener(vm, eventName, callback) {
        if (callback) {
            $(vm.remodal.$modal).off(eventName, callback);
        } else {
            $(vm.remodal.$modal).off(`${eventName}.remodal_${vm.showTimes - 1}`);
        }
        return vm;
    }
</script>

/*********************************************/

<style src="remodal/dist/remodal.css"></style>
<style lang="sass" rel="stylesheet/scss">
    @import "../../styles/loading_spinner";
    @import "../../styles/remodal-meetin-theme";
</style>
