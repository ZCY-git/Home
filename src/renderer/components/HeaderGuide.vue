<template>
    <div id="header-guide" class="header-guide">
        
        <div class="logo"><img src="~@/assets/cmslogo.png" alt="" class="logo-icon"><span class="logo-title">易视云</span></div>
        <div class="navmenu-bar">
            <div class="line"></div>
            <el-menu
            :default-active="activeIndex"
            class="themebgcolor el-menu bgcolor-2"
            mode="horizontal"
            @select="handleSelect"
            :text-color="ThemeColor"
            :active-text-color="ThemeAColor">
                <el-menu-item index="1" class="el-menu-item">首页</el-menu-item>
                <el-menu-item index="2" class="el-menu-item">回放</el-menu-item>
                <el-menu-item index="3" class="el-menu-item">设置</el-menu-item>
            </el-menu>
        </div>
        <div class="headerguide-right">
            <div class="headerguide-icon-box"><img src="~@/assets/message.svg" alt="" class="headerguide-icon"><i class="unread-circle bgcolor-red"></i></div>
            <div class="headerguide-icon-box"><img src="~@/assets/refresh.svg" alt="" class="headerguide-icon"></div>
            <div class="headerguide-icon-box headerguide-user-box"><img src="~@/assets/user.svg" alt="" class="user-icon bgcolor-0
            "></div>
            
        </div>
        <div class="username-box"><span class="username">JIU'AN</span></div>

    </div>
</template>
<script>
/* eslint-disable */

export default {
    name:'header-guide',
     data() {
      return {
        isActive: true,
        activeIndex: '1',//导航默认激活第一个
        lastActive:'1',//上一次激活的导航
        ThemeColor:'rgba(51,51,51,1)',//主题字体颜色
        ThemeAColor:' rgba(16,142,233,1)',//激活字体
        ThemeBgcolor:'rgba(228,228,228,1)',//主题背景
      };
    },
    methods: {
      handleSelect(key, keyPath) {
        // console.log(key, keyPath);

        // 传递到home.vue切换组件
        let switchComName = 'home-index';
        switch(key){   
            case '1':
                switchComName = 'home-index';
                break;
            case '2':
                switchComName = 'home-playback';
                break;
            case '3':
                switchComName = 'home-setting';
                break;
            default:
                switchComName = 'home-index';
        }
        if(this.lastActive!=key){
            console.log(switchComName);
            this.$emit("SwitchNavBar",switchComName);
            this.lastActive=key;
        }
       
        // this.$emit("SwitchNavBar",switchComName);
  
      }
    }
}
</script>


<style>

</style>


