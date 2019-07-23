import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'

import App from './App'
import router from './router'
import store from './store'
import Path from 'path'
import fse from 'fs-extra'
import Sqlite from './modules/database/sqlite.js'
import 'element-ui/lib/theme-chalk/index.css'
import '../../static/font-awesome-4.7.0/css/font-awesome.min.css'
import './modules/css/common.css'
import './modules/css/theme0.scss'
import './modules/css/cms.scss'

Vue.use(ElementUI)

if (!process.env.IS_WEB){
  Vue.use(require('vue-electron'))
} 

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.Path = Vue.prototype.Path = Path
Vue.fse = Vue.prototype.fse = fse
Vue.Sqlite = Vue.prototype.Sqlite = Sqlite
Vue.package = Vue.prototype.package = Vue.fse.readJSONSync(Path.join(__dirname, '../../package.json'))
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')




// 字体自适应大小
var fontSizeAuto = function(oriWidth,coe=21){
	return function(){
    var viewportWidth = document.documentElement.clientWidth;
    // if(viewportWidth == 1920){ viewportWidth= document.documentElement.clientWidth; }
    coe=21;
    if(viewportWidth> 1270){ coe=21 }
    else if(viewportWidth>1080 && viewportWidth < 1270){ coe=26 }
    else if(viewportWidth>720 && viewportWidth < 1080){ coe=30 }
    else if(viewportWidth>520 && viewportWidth < 720){ coe=40 }
    else if(viewportWidth>320 && viewportWidth < 520){ coe=50 }
    else if(viewportWidth < 320){ coe=60 }
    // else if(1080<viewportWidth < 1270){ coe=26 }
    // else if(720<viewportWidth < 1080){ coe=29 }
    // else if(320<viewportWidth < 720){ coe=35 }
    // else if(viewportWidth < 320){ coe=35 }
    else coe=21;
		document.documentElement.style.fontSize  = viewportWidth/(oriWidth/coe) +'px';	
	}
}

window.onresize = fontSizeAuto(1920);



