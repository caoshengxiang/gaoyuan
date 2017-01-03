<template>
    <div>
        <div class="form-header"><div class="title">登录</div></div>
        <el-form :model="accountForm" :rules="rules" ref="accountForm" label-width="70px" class="signIn-form">
            <el-form-item label="帐号" prop="account">
                <el-input v-model="accountForm.account" auto-complete="off"></el-input>
            </el-form-item>

            <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="accountForm.password" auto-complete="off"></el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="submitForm('accountForm')">Sign In</el-button>
                <el-button @click="resetForm('accountForm')">Reset</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    export default {
        name: '',
        data(){
            return {
                accountForm: {
                    account: '',
                    password: ''
                },
                rules: {
                    account: [
                        {required: true, message: '请输入帐号', trigger: 'blur'},
                        {min: 2, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur'}
                    ]
                }
            };
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid)=>{
                    if(valid){
                        alert('submit')
                    }
                })
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            }
        }
    }
</script>

<style lang="sass" rel="stylesheet/scss">
    @import "../styles/variable.scss";

    .form-header{
        width: 400px;
        height: 50px;
        background: $mainColor;
        margin: 0px auto;
        margin-top: 200px;
        border-radius: 10px 10px 0 0;
        .title{
            padding-top: 15px;
            margin-left: 20px;
            color: #fff;
        }
    }
    .signIn-form {
        width: 400px;
        margin: 0px auto;
        border: 1px solid $mainColor;
        padding: 20px;
    }

    .el-input__inner {
        border-color: #c0ccda !important;
    }
</style>