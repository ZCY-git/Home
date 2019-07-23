<template>
<div  id="homeplayback-pagination" class="" >
    <div class="block">
      <span class="demonstration">完整功能</span>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage4"
        :page-sizes="[100, 100, 100, 20]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="1400">
      </el-pagination>
  </div>
</div>
   
</template>
<script>
/* eslint-disable */
  export default {
    name:'homeplayback-pagination',
    methods: {
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
      }
    },
    data() {
      return {
        currentPage1: 5,
        currentPage2: 5,
        currentPage3: 5,
        currentPage4: 4
      };
    }
  }
</script>
<style>

</style>
