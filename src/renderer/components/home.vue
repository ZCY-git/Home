<template>
    <div id="home" class="bgcolor-0">
      <div class="bgcolor-2">
        <header-guide class="home-header " @SwitchNavBar="HomeSwitchNavBar"></header-guide>
      </div>
        
      <component :is="comNameRightPanel " class="home-content"></component>
        
    </div>
</template>
<script>
/* eslint-disable */
  import HeaderGuide from './HeaderGuide'
  import HomeIndex from './HomeIndex'
  import HomePlayback from './HomePlayback'
  import HomeSetting from './HomeSetting'
 
  export default {
      name:'home-page',
      components: { HeaderGuide, HomeIndex,HomePlayback,HomeSetting },
      data() {
        return {
          activeIndex: '1',
          comNameRightPanel:'home-index',
        };
      },
      methods: {
        
        // 切换导航
        HomeSwitchNavBar:function(key){
          this.comNameRightPanel=key;
        }
      }
  }
</script>


<style>
/* * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  } */
 /* .home{
   width:100%;
   height:inherit;
   background-color: rgba(242,242,242,1);
       border:1px solid rgba(204,204,204,1);
 } */

</style>


