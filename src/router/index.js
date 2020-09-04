import Vue from 'vue'
import Router from 'vue-router'
const _import = require('./_import_' + process.env.NODE_ENV);

Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/',
      redirect:'/index'
    },{
      path: '/index',
      component: _import('index'),
      name: 'index',
    },{
      path: '/mall',
      component: _import('mall'),
      name: 'mall',
    },{
      path: '/order',
      component: _import('order'),
      name: 'order',
    },{
      path: '/exchange',
      component: _import('exchange'),
      name: 'exchange',
    }
  ]
})
