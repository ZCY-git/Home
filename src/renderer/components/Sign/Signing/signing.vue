<template>
    <div id="signing">
        <div class="signing-box">
            <div class="signing-content">
                <div class="user-login">用户登录</div>

                <div class="inp-text">
                    <input type="text" placeholder="请输入帐号">
                    <i class="el-icon-caret-bottom"></i>
                </div>
                <div class="error">
                    <span v-show="error"><i class="el-icon-warning"></i> 帐号不存在</span>
                </div>
                
                <div class="inp-pwd">
                    <input :type="[pwd ? 'password' : 'text']"  placeholder="请输入密码">
                    <i class="el-icon-view" @click=" pwd = !pwd "></i>
                </div>  
                <div class="error">
                    <span v-show="error"><i class="el-icon-warning"></i> 密码错误</span>
                </div>

                <div class="check-box">
                    <!-- <label class="checkBox"><input type="checkbox"/>记住密码</label>
                    <label class="checkBox"><input type="checkbox"/>自动登录</label> -->
                    <!-- <input type="checkbox">记住密码
                    <input type="checkbox">自动登录 -->
                    <el-checkbox>记住密码</el-checkbox>
                    <el-checkbox>自动登录</el-checkbox>
                </div>
                <div class="load-box">
                    <!-- <dir class="load">登录</dir> -->
                    <!-- <input type="button" value="登录"> -->
                    <el-button type="native-type" :disabled="isDisable" class="btn" :class="[isDisable ? 'disBtn' : 'unDisBtn']">登录</el-button>
                </div>
                <div class="other-options">
                    <div @click="options(true)">注册帐号</div>
                    <div @click="options(false)">忘记密码？</div>
                </div>

                <div class="experience" @click="showError">体验一下</div>
            </div>
            
        </div>
    </div>
</template>

<script>
    export default {
        name: "signing",
        data() {
            return {
               isDisable: true,

               checked: 0,

               //密码显示
               pwd: true,

               //错误提示
               error: false
            }
        },
        methods: {
            options(flag) {
                if(flag) {
                    this.$emit("state", {name:"registration-reset", text:"注册帐号"})
                }else {
                    this.$emit("state", {name:"registration-reset", text:"重置登录密码"})
                }
            },
            showError() {
                this.error = !this.error
            }
        }
    }
</script>

<style lang="scss" scoped>
    #signing {
        background-color: #F0F0F5;
    }

    .signing-box {
        width: 100%;
        height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;

        .signing-content {
           width: 80%;
           position: relative;

            .user-login {
                width: 100%;
                font-size: 17px;
                text-align: center;
                padding: 10px 0;
            }

            input {
                width: 85%;
                background-color: #F0F0F5;
                outline: none;
                border: none;
            }

            ::-webkit-input-placeholder {
                color: #B2B2B4;
                font-size: 13px;
            }

            .inp-text,
            .inp-pwd {
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid #DFDFE1;
                padding: 10px 0;

                i {
                    cursor: pointer;
                    font-size: 20px;
                }
            }

            .error {
                color: red;
                height: 1.5em;
            }

            .check-box {
                width: 100%;    
                padding: 0 0 10px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                // margin-top: 5px;

                // label {
                //     display: flex;
                //     align-items: center;
                //     vertical-align: middle;
                // }

                // input {
                //     width: 16px;
                //     height: 16px;
                //     // background-color: #fff;
                //     -webkit-appearance:none;
                //     border: 1px solid #c9c9c9;
                //     border-radius: 2px;
                //     outline: none;
                // }
            }

            .load-box {
                margin-top: 10px;
                display: flex;
                justify-content: center;

                .btn {
                    width: 90%;
                    border-radius: 15px;
                }

                .disBtn {
                    background: #97b4dc;
                }

                .unDisBtn {
                    background: #3e78c4;
                    color: #FFF;
                }
            }

            .other-options {
                font-size: 13px;
                color: #8D8D8E;
                display: flex;
                justify-content: center;

                div {
                    margin: 10px 0;
                    padding: 0 10px;
                    cursor: pointer;
                }

                :nth-child(1) {
                    border-right: 1px solid #8D8D8E;
                }
            }

            .experience {
                position: absolute;
                // width: 100%;
                left: 50%;
                transform: translateX(-50%);
                margin: 0 auto;
                text-align: center;
                padding: 6px 10px 6px 0;
                color: blue;
                font-size: 13px;
                cursor: pointer;
            }
        }
    }
</style>

