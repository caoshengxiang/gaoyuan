<template>
    <div class="page-index">
        <page-header></page-header>
        <left-menu></left-menu>
        <router-view class="content"></router-view>
    </div>

</template>

<script>
    import leftMenu from '../left_menu.vue';
    import pageHeader from '../page_header.vue'
    export default {
        name: 'index',
        components: {
            pageHeader,
            leftMenu,
        }
    }
</script>

<style lang="sass" rel="stylesheet/scss">
    @import "../../styles/variable.scss";
    .page-index {
        min-height: 100vh;
        min-width: 100vw;
        position: relative;
        .content{
            background: $contentBg;
            position: absolute;
            top: $headerHeight;
            left: 200px;
            bottom: 0;
            right: 0;
            padding: 20px;
        }
    }
</style>
