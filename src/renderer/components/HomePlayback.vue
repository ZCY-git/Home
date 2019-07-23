<template>
    <div id="home-playback">
          
          <div class="left-coment border-0">
             <homeplayback-sidebar></homeplayback-sidebar>
          </div>
          <div class="right-coment bgcolor-1" >
             
              <div  class="right-header bgcolor-0 border-t-0 border-b-0">
                <homeplayback-header></homeplayback-header>
                <homeplayback-datepicker></homeplayback-datepicker>
              </div>
              <div class="right-center"> 右侧中间</div>
              <div class="right-footer bgcolor-0 border-t-0 border-b-0">
                  <homeplayback-pagination></homeplayback-pagination>
              </div>
             
          </div>
         
    </div> 
</template>
<script>
/* eslint-disable*/
   
  
  import HomeplaybackSidebar from './HomePlayback/Sidebar/HomeplaybackSidebar'
  import HomeplaybackHeader from './HomePlayback/Header/HomeplaybackHeader'
  import HomeplaybackDatepicker from './HomePlayback/Header/HomeplaybackDatepicker'
  import HomeplaybackPagination from './HomePlayback/Footer/HomeplaybackPagination'
  
  export default {
    name:'homeplayback-datapicker',
    components: { HomeplaybackSidebar,HomeplaybackHeader, HomeplaybackDatepicker,HomeplaybackPagination},
    data(){
      return{

      }
    },
    methods: {
  
    }
  }
  
</script>
<style>
 
</style>
