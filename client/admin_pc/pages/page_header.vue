<template>
    <div class="page-header">
        <div class="title">会众定制服务管理</div>
        <div class="account">
            <span>欢迎你，{{userName}}</span>
            <img :src="headImg">
            <ul class="dash">
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    </div>
</template>

<script>
    import headImg from '../images/topbar_logo.png'
    export default {
        name: '',
        data(){
            return {
                userName: '保罗',
                headImg: headImg
            }
        }
    }
</script>

<style lang="sass" rel="stylesheet/scss">
    @import "../styles/variable.scss";

    .page-header {
        background: $mainColor;
        height: 80px;
        min-width: 500px;
        .title {
            float: left;
            margin-left: 30px;
            margin-top: 30px;
            color: #fff;
            font-weight: 600;
        }
        .account {
            float: right;
            color: #fff;
            display: flex;
            align-items: center;
            height: 100%;
            img {
                width: 42px;
                height: 42px;
                border-radius: 50%;
                margin: 0 20px 0 20px;
            }
            .dash {
                margin: 0 20px;
                li{
                    list-style-type: disc;
                    background: #fff;
                    line-height: 15px;
                }
            }
        }
    }
</style>