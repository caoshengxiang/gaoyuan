<template>
    <input class="limit-input" type="text"
           :class="{'invalid':!isValid}"
           v-model.trim="inputValue"
           :placeholder="label"
           :maxlength="maxLength"
           @propertychange="onTextChanged"
           @input="onTextChanged"
           @keyup.enter="onPressEnter">
</template>

<script type="text/babel">
    // 用户敲回车的事件
    const PRESS_ENTER = 'press-enter';

    export default {
        props: {
            // 该输入框的名字，会显示在placeholder中
            label: {
                type: String,
                default: ''
            },
            maxLength: {
                type: Number,
                default: 50
            },
            // 输入框中的默认值
            defaultValue: {
                type: String,
                default: ''
            },
            isRequired: {
                type: Boolean,
                default: false
            },
            // 输入数据是否正确的校验器
            validator: {
                type: RegExp,
                default: () => /^\d+$/
            },
            // 过滤不合法字符的正则匹配器
            invalidFilter: {
                type: RegExp,
                default: () => /[^\d]/g
            }
        },
        data() {
            return {
                inputValue: this.defaultValue && this.defaultValue.trim(),
            }
        },
        computed: {
            isValid() {
                return !this.inputValue && !this.isRequired || this.validator.test(this.inputValue) && this.isRequired;
            },
        },
        methods: {
            onPressEnter,
            onTextChanged,
            clear() {
                this.inputValue = '';
            }
        },
        watch: {
            inputValue(newValue) {
                this.$emit('input', newValue);
            }
        }
    };

    function onPressEnter(event) {
        this.$emit(PRESS_ENTER, event);
    }

    /**
     * 输入框内容变化时，过滤掉不允许输入的字符
     * @param event
     */
    function onTextChanged(event) {
        const elem = event.target;
        const newValue = elem.value;
        const replacedValue = newValue.replace(this.invalidFilter, '');
        if (newValue !== replacedValue) {
            this.$nextTick(() => {
                elem.value = replacedValue;
            })
        }
    }
</script>

<style lang="sass" rel="stylesheet/scss">
    @import "../../styles/basic_const";

    input.limit-input {
        width: 100%;
        height: 100%;
        padding-left: 17px;
        padding-right: 17px;
        border: 1px solid $line-border;
        border-radius: 5px;
        color: $text-normal;
        outline: none;
        -webkit-appearance: none;
    }
</style>
