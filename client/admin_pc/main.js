import Promise from 'bluebird';
import Vue from 'vue';
// 加载大红条，捕获未处理的异常
// noinspection ES6UnusedImports
import debugNotify from './utils/debug_notify';
import commonUtils from './utils/common_utils';
import App from './app.vue';

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
Vue.use(ElementUI);

/** *****************全局变量****************** */
window.Vue = Vue;
window.Promise = Promise;

window.commonUtils = commonUtils;

/** ***************全局变量 end****************** */


new Vue(App).$mount('#app');
