<template>
    <router-view class="page-root"></router-view>
</template>
<script>
    import Vue from 'vue';
    import VueRouter from 'vue-router';
    import {sync} from 'vuex-router-sync';
    import router from './router';
    // import store from './store';

    // sync(store, router);
    Vue.use(VueRouter);

    /**
     * 设置title用的指令。使用方法<div v-title="'标题内容'"></div>
     */
    Vue.directive('title', {
        inserted: function(el, binding) {
            document.title = binding.value
        }
    })
    export default {
        // store,
        data() {
            return {};
        },
        // 通过 router 配置参数注入路由，从而让整个应用都有路由功能
        router,
    }
</script>

<!-- 全局样式 -->
<style src="./styles/normalize.css"></style>
<style lang="sass" src="./styles/basic.scss"></style>
