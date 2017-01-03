<template>
    <div class="left-menu">
        <ul>
            <li v-for="item in menu" class="menu-item">
                <span :class="{'menu-active': item.active}"></span>
                <router-link
                    :to="item.toPath"
                    @click.native="menuEvent(item)"
                    class="router-line"><img :src="item.icon">{{item.name}}</router-link>
            </li>
        </ul>
    </div>
</template>

<script>
    const logo = require('../images/topbar_logo.png');


    export default {
        name: '',
        data(){
            return {
                menu: [
                    {
                        name: '会众游戏',
                        icon: logo,
                        active: true,
                        toPath: '/app/games'
                    },
                    {
                        name: '松散式会员',
                        icon: logo,
                        active: false,
                        toPath: '/app/member'
                    },
                    {
                        name: '定制邀请函',
                        icon: logo,
                        active: false,
                        toPath: '/app/invite'
                    },
                    {
                        name: '员工账号生成',
                        icon: logo,
                        active: false,
                        toPath: '/app/employee'
                    }
                ],
            }
        },
        methods: {
            menuEvent(obj){
                this.menu.forEach((item)=>{
                    item.active = false;
                })
                obj.active = true;
            }
        }
    }
</script>

<style lang="sass" rel="stylesheet/scss">
    @import "../styles/variable.scss";

    .left-menu {
        width: 200px;
        position: absolute;
        top: $headerHeight;
        bottom: 0;
        .menu-item {
            padding: 20px;
            position: relative;
            img {
                width: 32px;
                margin-right: 10px;
            }
            span{
                position: absolute;
                left: 0px;
                top: 0;
                display: inline-block;
            }
        }
        .menu-item:nth-child(1) {
            margin-top: 50px;
        }
        .menu-active {
            width: 5px;
            height: 62px;
            background: $mainColor;
        }
        .router-line{
            color: #000000;
            text-decoration: none;
        }
        .router-line:hover {
            cursor: pointer;
        }
    }
</style>