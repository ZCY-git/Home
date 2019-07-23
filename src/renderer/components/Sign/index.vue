<template>
    <div id="sign-index">
        <div class="sign-top">

        </div>
        <div class="sign-bottom">
            <div class="sign-content">
                <div class="left-content">
                    <span class="name">{{leftContent}}</span>
                </div>
                <div class="right-content">
                    <component :is="rightContent" v-on:state="childInfo" :pageName="leftContent"></component>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import signing from "./Signing/signing"
    import registrationReset from "./RegistrationReset/registration-reset"
    export default {
        name: 'sign-index',
        components: { signing, registrationReset },
        data() {
            return {
                leftContent: "易视云摄像监控系统",

                rightContent: "signing"
            }
        },
        methods: {
            childInfo(info) {
                this.rightContent = info.name
                this.leftContent = info.text
            }
        }
    }
</script>

<style lang="scss" scoped>
    .sign-top {
        width: 100vw;
        height: 5vh;
        background-color: rgba(0, 0, 0, 0.9);
    }

    .sign-bottom {
        width: 100vw;
        height: 95vh;
        background-color: black;
        position: relative;

        .sign-content {
            width: 55vw;
            height: 60vh;
            background-color: #fff;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            .left-content {
                width: 40%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                float: left;
                position: relative;

                .name {
                    // font: {
                    //     size: 18px;
                    //     color: #FFF;
                    // } 
                    width: 100%;
                    font-size: 20px;
                    text-align: center;
                    color: #fff;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
            }

            .right-content {
                width: 60%;
                height: 100%;
                float: left;
            }
        }
    }
</style>

