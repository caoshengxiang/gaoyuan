import VueRouter from 'vue-router';
import indexPage from './pages/admin/index.vue';
import page404 from './pages/404.vue';
import signIn from './pages/signIn.vue';
import games from './pages/games/games.vue';
import inviteCard from './pages/invite/invite_card.vue'
import member from './pages/member/menber.vue'
import accountGeneration from './pages/account_generation/account_generation.vue'

// 定义路由映射。 其中"component" 可以是通过 Vue.extend() 创建的组件构造器，或者组件配置对象
const routes = [
    {
        path: '',
        component: indexPage,
        children: [
            {
                path: '',
                component: games
            }
        ]
    },
    {
        path: '/login',
        component: signIn,
    },
    {
        path: '/app',
        component: indexPage,
        children: [
            {
                path: '',
                component: games
            },
            {
                path: 'games',
                component: games
            },
            {
                path: 'invite',
                component: inviteCard
            },
            {
                path: 'member',
                component: member
            },
            {
                path: 'employee',
                component: accountGeneration
            }
        ]
    },
    // {
    //     path: '/app',
    //     component: index,
        // children: [
        //     {
        //         path: '',
        //         component: indexImg,
        //     },
        //     {
        //         path: 'indexImg',
        //         component: indexImg,
        //     },
        // ],
        // meta: {}
    // },
    // 必须放最后
    {path: '*', component: page404, meta: {}},
]

// 创建 router 实例
const router = new VueRouter({
    // 不使用hash模式，用/连接各级路径，需要在服务端进行相关配置
    mode: 'history',
    routes,
    scrollBehavior (to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        return {x: 0, y: 0}
    },
})

router.beforeEach((to, from, next) => {
    console.log(`${from.fullPath} -> ${to.fullPath}`);
    // 获取微信openid
    // if (to.matched.some(record => record.meta.needWxOpenId)) {
    //     if (!to.params.wx_openid) {
    //         location.href = `/wechat/wx_openid?redirect=${encodeURIComponent(to.fullPath)}`;
    //         return;
    //     }
    // }
    next();
});

router.afterEach((to) => {
    // 越里面的组件title优先级越高，所以倒过来查找
    // for (let i = to.matched.length - 1; i >= 0; i--) {
    //     const record = to.matched[i];
    //     if (record.meta.title) {
    //         document.title = record.meta.title;
    //         break;
    //     }
    // }
});

export default router;
