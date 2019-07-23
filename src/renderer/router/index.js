import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/',
    //   name: 'landing-page',
    //   component: require('@/components/LandingPage').default
    // },
    {
      path: '/',
      name: 'home-page',
      redirect: { name: "sign-index" },
      component: require('@/components/home').default,
      // children: [
      //   {
      //     path: '/sign',
      //     name: 'sign-index',
      //     component: require('@/components/Sign').default,
      //   }
      // ]
    },
    {
      path: '/sign',
      name: 'sign-index',
      component: require('@/components/Sign').default,
    }
    // {
    //   path: '*',
    //   redirect: '/'
    // }
  ]
})
