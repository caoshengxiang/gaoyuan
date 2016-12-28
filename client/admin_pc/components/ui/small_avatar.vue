<template>
    <div :style="avatarStyle"></div>
</template>

<script type="text/babel">
    import imageUtils from 'common/image_url_utils'
    import specialLogic from 'common/special_logic';

    export default {
        name: 'small-avatar',
        props: {
            /** 原始头像地址 */
            url: {
                type: String,
                default: ''
            },
            /** 主办方openId，会根据它获取定制需求的配置 */
            sponsorOpenId: {
                type: String,
                default: ''
            },
            /** 缩略图尺寸，目前仅支持160，300，640 */
            size: {
                type: Number,
                default: 160
            }
        },
        data() {
            return {
                cardConfig: this.$store.state.member.cardsConfig.list[specialLogic.getCardsConfigIndexBySponsorId(this.sponsorOpenId)],
            }
        },
        computed: {
            avatarStyle() {
                const bgUrl = this.url ? imageUtils.getThumbUrl(this.url, this.size) : this.cardConfig.defaultAvatar;
                return {'background-image': `url(${bgUrl})`};
            },
        },
    };
</script>

<style lang="sass" rel="stylesheet/scss" scoped>
    div {
        background: transparent center center no-repeat;
        background-size: cover;
        background-origin: border-box;
    }
</style>
