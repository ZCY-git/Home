<template>
  <div  id="light-ctrl">
    <el-scrollbar style="height:100%">
      <div class="lightctrl-box">

          <div class="lamp-icon"> <i class="fa fa-lightbulb-o"  ref="lamp"></i></div>
          <div class="lightctrl-buttonbox">
              <div class="lightctrl-button light-button" :class="{lampStateActive:lampState=='on'}" @click="lightoffon('on')" ref="lighton">开灯</div>
              <div class="lightctrl-button off-button" :class="{lampStateActive:lampState=='off'} " @click="lightoffon('off')" ref="lightoff">关灯</div>
          </div>
          <div class="lightctrl-buttonbox">
            <div class="lightctrl-button light-button" :class="{lampStateActive:lampState=='auto'}" @click="lightoffon('auto')" ref="lightauto">自动</div>
            <div class="lightctrl-button off-button" :class="{lampStateActive:lampState=='smart'} " @click="lightoffon('smart')" ref="lightsmart">智能</div>
          </div>
          <div class="lightctrl-slide">
              <div class="slide-title">亮度</div>
              <div class="slide-box">
                <div class="block">
                  <el-slider
                    v-model="sliderValue"
                    show-tooltip>
                  </el-slider>
                </div>
              </div>
          </div>
        
      </div>
  </el-scrollbar>
<!-- 



    <el-row class="tac">
      <el-col :span="6">
        <el-menu
            default-active="3"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            :background-color="ThemeBgcolor"
            :text-color="ThemeColor"
            :active-text-color="ThemeAColor">
            <el-submenu index="3">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span class="sidebar-title">灯控</span>
              </template>
              
             
              
            </el-submenu>
          </el-menu>
      </el-col>
    </el-row> -->
  </div>
</template>
<script>
/* eslint-disable */

export default {
    name:'light-ctrl',
    data () {
     return {
        activeIndex: '1',
        sliderValue:10,
        lightActive:false,//灯开关
        lampState:'off',//灯状态
        handleClosekey:1,
        ThemeColor:'rgba(51,51,51,1)',//主题字体颜色
        ThemeAColor:' rgba(16,142,233,1)',//激活字体
        ThemeBgcolor:'rgba(242,242,242,1)',//背景
      }
    },
    methods:{
        
      lightoffon(isOn='off') {
        console.log("as",this.$data);
            switch(isOn){
            case 'on':
                this.lampState='on';
                break;
            case 'off':
                this.lampState='off';
                break;
            case 'auto':
                this.lampState='auto';
                break;
            case 'smart':
                this.lampState='smart';
                break;
            default:
                this.lampState='off';        
          }
          
      }
    }
}
</script>
<style >

</style>


