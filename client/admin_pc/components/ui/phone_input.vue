<template>
    <limit-input ref="input"
                 class="phone-input"
                 :label="label"
                 :max-length="maxLength"
                 :default-value="defaultValue"
                 :is-required="isRequired"
                 :validator="inputValidator"
                 :invalid-filter="inputInvalidFilter"
                 v-model="phone"
                 @press-enter="onPressEnter"></limit-input>
</template>

<script type="text/babel">
    import specialLogic from 'common/special_logic';
    import limitInput from './limit_input';

    // 输入数据合法性改变的事件
    const VALID_CHANGED = 'valid-changed';
    // 用户敲回车的事件
    const PRESS_ENTER = 'press-enter';

    export default {
        props: {
            /** 该输入框的名字，会显示在placeholder中 */
            label: {
                type: String,
                default: '请输入手机号'
            },
            /** 输入框中的默认值 */
            defaultValue: {
                type: String,
                default: ''
            },
            isRequired: {
                type: Boolean,
                default: false
            },
            /** 主办法openId，如果不为空，则会检测当前主办方是否允许输入外国手机 */
            sponsorOpenId: {
                type: String,
                default: '',
            },
            /** 是否一旦输入过国内手机号，就不允许输入国外手机号了 */
            chinesePrimary: {
                type: Boolean,
                default: true
            }
        },
        data() {
            const chinesePhoneValidator = window.devEnv ? /^[19]\d{10}$/ : /^1\d{10}$/;
            return {
                phone: this.defaultValue,
                // 国内手机号的校验器
                chinesePhoneValidator,
                // 国外手机号的校验器
                foreignPhoneValidator: /^\d{7,}$/,
                // 输入数据中不合法字符的过滤器
                inputInvalidFilter: /[^\d]/g,
                // 是否曾经输入过国内的手机号。不能表示“当前是否输入了国内的手机号”
                hasInputChinesePhone: chinesePhoneValidator.test(this.defaultValue),
                isValid: false,
            }
        },
        computed: {
            /** 是否允许输入外国手机号 */
            allowForeignPhone() {
                return this.sponsorOpenId && specialLogic.isForeignPhoneAvailableSponsorId(this.sponsorOpenId);
            },
            /** 是否只允许输入国内手机号 */
            onlyChinesesPhone() {
                return this.chinesePrimary && this.hasInputChinesePhone || this.currentIsChinesePhone || !this.allowForeignPhone;
            },
            /** 输入数据是否正确的校验器 */
            inputValidator() {
                // 如果当前主办方允许输入外国手机，则采用宽松的输入限制
                return this.onlyChinesesPhone ? this.chinesePhoneValidator : this.foreignPhoneValidator;
            },
            maxLength() {
                return this.onlyChinesesPhone ? 11 : 20;
            },
            /** 当前用户是否输入了一个国内手机号 */
            currentIsChinesePhone() {
                const result = this.chinesePhoneValidator.test(this.phone);
                if (result) {
                    this.hasInputChinesePhone = true;
                }
                return result;
            }
        },
        components: {
            limitInput,
        },
        methods: {
            onPressEnter() {
                this.$emit(PRESS_ENTER, event);
            }
        },
        watch: {
            phone(newValue) {
                this.$emit('input', newValue);
                this.isValid = this.$refs.input.isValid;
            },
            inputValidator() {
                // 修改校验器后子组件会重新计算合法性
                this.$nextTick(() => {
                    this.isValid = this.$refs.input.isValid;
                })
            },
            isValid(newValue) {
                this.$emit(VALID_CHANGED, newValue);
            },
        },
        mounted() {
            this.$nextTick(() => {
                // 收集初始数据
                this.isValid = this.$refs.input.isValid;
            })
        }
    };
</script>

<style lang="sass" rel="stylesheet/scss">
    @import "../../styles/basic_const";

    .phone-input {
    }
</style>
