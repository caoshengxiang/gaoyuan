<template>
    <div v-title="'出错了'" class="page-404">
        <div class="content">
            <p>哇塞，你找到了一个不存在的页面</p>
            <a href="/">去官网看看？</a>
        </div>
        <remodal ref="remodal"></remodal>
    </div>
</template>

<script type="text/babel">
    import remodal from '../components/ui/remodal.vue';
    import debugNotify from '../utils/debug_notify';

    export default {
        data() {
            return {};
        },
        components: {
            remodal,
        },
        mounted() {
            debugNotify.showInfo(this.$route.fullPath);
        }
    }
</script>

<style lang="sass" rel="stylesheet/scss">
    @import "../styles/basic_const";

    .page-404 {
        width: 100%;
        height: 100%;
        /*background: url(../images/404_bg.jpg) center;*/
        background-size: cover;
        .content {
            position: fixed;
            top: 50%;
            margin-top: -20px;
            width: 100%;
            font-size: 16px;
            text-align: center;
        }
        p {
            margin: 0 auto 30px;
            color: #fff;
        }
        a {
            padding: 8px 30px;
            border: 1px solid $line-border;
            border-radius: 20px;
            color: #fff;
            text-decoration: none;
            display: inline-block;
        }
    }
</style>
