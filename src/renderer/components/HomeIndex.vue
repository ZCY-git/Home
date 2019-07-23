<template>
    <div id="home-index">
          
          <div class="left-coment border-0">
            <homeindex-sidebar></homeindex-sidebar>
          </div>
          <div class="right-coment bgcolor-1" >
             
              <div  class="right-header bgcolor-0 border-t-0 border-b-0">
                <Homeindex-header></Homeindex-header>
              </div>
              <div class="right-center"></div>
              <div class="right-footer bgcolor-0 border-t-0 border-b-0">
                <homeindex-footer></homeindex-footer>
              </div>
             
          </div>
         
    </div> 
</template>
<script>

/* eslint-disable*/

    import HomeindexSidebar from './HomeIndex/Sidebar/HomeindexSidebar'
    import HomeindexHeader from './HomeIndex/Header/HomeindexHeader'
    import HomeindexFooter from './HomeIndex/Footer/HomeindexFooter'
    
    export default {
      name:'home-index',
      components: { HomeindexFooter, HomeindexSidebar, HomeindexHeader },
      data() {
        return {
        
        };
      },
      methods: {
   
      }
    }
</script>
<style>

</style>


