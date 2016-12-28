<template>
    <div class="page-index">
        <router-view></router-view>
        <div>1231313</div>
    </div>

</template>

<script>
//    import vButton from '../components/vButton.vue';
    export default {
        name: 'index',
        components: {
//            vButton
        }
    }
</script>

<style lang="sass" rel="stylesheet/scss">

    .page-index {
        min-height: 100vh;
        min-width: 100vw;
    }
</style>
