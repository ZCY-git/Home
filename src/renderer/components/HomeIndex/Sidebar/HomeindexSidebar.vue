<template>

<div id="homeindex-sidebar" >

    <div class="sidebar clearfloat">
        <el-row class="tac">
        <el-col :span="6">
          
          <el-menu
            :default-active="activeIndex"
            class="el-menu-vertical-demo sidebar-menu bgcolor-0"
            @open="handleOpen"
            @close="handleClose"
            unique-opened>
            <el-submenu index="1" class="sidebar-menu-li ">
              <template slot="title" class="mydevices-title-box"> 
                <div class="sidebar-title-box">
                  <span class="sidebar-title">我的设备</span>
                  <i class="fa fa-lg fa-plus-square-o" ></i>
                </div>
              </template>
              
              <div class="device-list-box">
                <el-scrollbar style="height:100%">
                    <device-list class="device-item"></device-list>
                    <device-list class="device-item"></device-list>
                    <device-list class="device-item"></device-list>
                 </el-scrollbar>
              </div>            
            </el-submenu>
            
            <el-submenu index="2">
                <template slot="title" >
                  <span class="sidebar-title">云台</span> 
                </template>
                <!-- <el-menu-item index="2-1">选项1</el-menu-item> -->
                <div class="sidebar-li-box">
                  <cloud-deck></cloud-deck>
               </div>
            </el-submenu>
            <el-submenu index="3">
                <template slot="title">
                   <span class="sidebar-title">灯控</span> 
                </template>
                <!-- <el-menu-item index="2-1">选项1</el-menu-item> -->
                <div class="sidebar-li-box">
                    <light-ctrl></light-ctrl>
                </div>
            </el-submenu>

            </el-menu>
        </el-col>
        
      </el-row>

          
      
    </div>

      

</div>
</template>

<script>
/* eslint-disable */
import DeviceList from '../../Common/Sidebar/DeviceList'
import CloudDeck from './CloudDeck'
import LightCtrl from './LightCtrl'

export default {
    name:'homeindex-sidebar',
    components: { DeviceList,CloudDeck,LightCtrl},
    props:['ShowSideBar'],
    data () {
      return {
        activeIndex: '1',
        ThemeColor:'rgba(51,51,51,1)',//主题字体颜色
        ThemeAColor:' rgba(16,142,233,1)',//激活字体
        ThemeBgcolor:'rgba(242,242,242,1)',//背景
      }
    },
    watch:{
      
    },
    methods: {
      handleOpen(key, keyPath) {
        // console.log(key, keyPath);
        console.log(this.$data);
      },
      handleClose(key, keyPath) {
        // console.log(key, keyPath);
      },

    }
  }
</script>

<style>
 
</style>

