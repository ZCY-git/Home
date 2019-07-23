<template>
    <div id="homeplayback-sidebar">
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
              <div  class="sidebar-menu-button border-b-0">
                <div class="sidebar-title-box">
                  <span class="sidebar-title">截图与录像</span>
                  <i class="fa fa-lg fa-file-image-o" ></i>
                </div>
              </div>
              
              </el-menu>
          </el-col>
          
        </el-row>
         
      </div>
    </div>
</template>

<script>
/* eslint-disable */
import DeviceList from '../../Common/Sidebar/DeviceList'


export default {
    name:'home-sidebar',
    components: { DeviceList},
     props:['ShowSideBar'],
    data () {
      return {
        activeIndex: '1',
        playbackSidebar:false,//隐藏回放侧边栏item
        settingSidebar:false,
        homeindexSidebar:false,
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
        // this.showsidebaritem();
      },
      handleClose(key, keyPath) {
        // console.log(key, keyPath);
      },
      
      addDevices(){// 添加设备

      },
     
      // 按传回的参数动态显示对应的侧边栏
      showsidebaritem(switchbar=this.ShowSideBar){
        if(switchbar){
          console.log(this.ShowSideBar);
          switch(switchbar){   
            case 'playbackSidebar':
                this.playbackSidebar=true;
                break;
            case 'settingSidebar':
                this.settingSidebar=true;
                break;
            case 'homeindexSidebar':
                this.homeindexSidebar=true;
                break;
            default:
                this.playbackSidebar=true;
          }
          
        }
      }
    }
  }
</script>

<style>

  
</style>

