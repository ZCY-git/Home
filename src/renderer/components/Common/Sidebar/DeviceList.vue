<template>
    <div id="device-list">
        
            <el-submenu :index="navIndex">
                <template slot="title">设备1</template>
                <!-- <el-menu-item index="1-3-1">
                    
                </el-menu-item> -->
                <div class="device-box">

                    <div class="device-review-one bgcolor-4">
                        <i class="fa fa-lg fa-play-circle-o play-icon" ></i>
                    </div>
                    <div class="device-review-more">
                        <div class="device-review-item bgcolor-4">
                            <i class="fa fa-lg fa-play-circle-o play-icon" ></i>
                        </div>
                        <div class="device-review-item bgcolor-4">
                            <i class="fa fa-lg fa-play-circle-o play-icon" ></i>
                        </div>
                        <div class="device-review-item bgcolor-4">
                            <i class="fa fa-lg fa-play-circle-o play-icon" ></i>
                        </div>
                        <div class="device-review-item bgcolor-4">
                            <i class="fa fa-lg fa-play-circle-o play-icon" ></i>
                        </div>
                        <div class="device-review-item bgcolor-4">
                            <i class="fa fa-lg fa-play-circle-o play-icon" ></i>
                        </div>
                    </div>
                    
                    <div class="device-info">
                        <i class="fa fa-lg fa-th-list" ></i>
                        <div class="device-detial"> <span>设备</span><span class="device-name">{{deviceName}}</span></div>
                        <i class="fa fa-lg fa-wifi" ></i>
                    </div>
                </div>
            </el-submenu>  
    </div>
</template>
<script>
/* eslint-disable */
  
  export default {
    name:'device-list',
    data(){
        return{
            deviceName:'88888',
            navIndex:'1-1'//必须根据设备设置导航菜单的index,值为【1-】开头，例如1-1、1-2
        }
    },
    methods: {
    
    },
    
}
</script>
<style>


</style>


