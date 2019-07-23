<template>
    <div class="header" id="homeplayback-header"> 
       <div class="header-box">
           <div class="header-left">{{deviceName}}</div>
           <div class="header-center"></div>
           <div class="header-right">
               <div class="header-icon-box border-0">
                   <span class=" header-icon"><i class="fa fa-lg fa-edit"></i></span>
                   <span class=" header-icon-title">管理</span>
               </div>
               <div class="header-icon-box border-0">
                    <span class="header-icon"> <i class="fa fa-lg fa-cog "></i> </span> 
                   <span  class=" header-icon-title">设备设置</span>
               </div>
           </div>
       </div>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name:'homeindex-header',
    data () {
      return {
       deviceName:'设备123456',
      }
    },
}
</script>

<style>

</style>

