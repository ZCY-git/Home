<template>
    <div id="homeplayback-datapicker" class="bgcolor-2"> 
       <div class="datapicker-box">
           <div>
                <div class="block">
                    <!-- <span class="demonstration">带快捷选项</span> -->
                    <el-date-picker
                    v-model="value2"
                    align="center"
                    type="date"
                    placeholder="选择日期"
                    :picker-options="pickerOptions1">
                    </el-date-picker>
                </div>
             </div>
       </div>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name:'homeplayback-datapicker',
    data() {
      return {
        pickerOptions1: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: '昨天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }, {
            text: '一周前',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          }]
        },
        value1: '',
        value2: '',
      };
    },
}
</script>

<style>

</style>

