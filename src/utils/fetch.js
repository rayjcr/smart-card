import axios from 'axios';
import Vue from 'vue';
import {setTokenTime,clearTime} from '@/utils/comm'

// import VueCookie from 'vue-cookie'
// import Tips from '@/components/index.js';
// import Cookies from 'js-cookie'

// 创建axios实例
const service = axios.create({
  // baseURL: process.env.BASE_API, // api的base_url
  timeout: 20000 // 请求超时时间
});

// request拦截器
service.interceptors.request.use(config => {
    if(window.localStorage.getItem('token')){
      // setTokenTime();
    }
    // console.log(Cookies.get('token'))
    if(window.localStorage.getItem('token')){
        config.headers.Authorization = window.localStorage.getItem('token'); 
    }
    // console.log(config)
    return config;
}, error => {
  // Do something with request error
  // console.log(error); // for debug
    Promise.reject(error);
})

// respone拦截器
service.interceptors.response.use(
  response => {
    /**
     * 下面的注释为通过response自定义code来标示请求状态，当code返回如下情况为权限有问题，登出并返回到登录页
     * 如通过xmlhttprequest 状态码标识 逻辑可写在下面error中
     */
    const res = response.data;
    if (response.status === 401 || res.status === 40101) {
      return Promise.reject('error');
    }
    if (res.status === 40301) {
      return Promise.reject('error');
    }
    if (response.status !== 200 && res.status !== 200) {
      Vue.prototype.$LayerTips({content:'加载信息出错',time:2000});
    } else {
      return response.data;
    }
  },
  error => {
    
    // Vue.prototype.$LayerTips({content:'response.exceptions',time:200000});
    if (error.response.request.responseType == 'arraybuffer') {
      const array = error.response.data;
      const blob = new Blob([array]);
      const reader = new FileReader();
      reader.readAsText(blob, 'utf-8');
      reader.onload = function(e) {

        
        // Notification({
        //   title: '错误',
        //   message: reader.result,
        //   type: 'error',
        //   duration: 5 * 1000
        // });
        // Message({
        //   message: reader.result,
        //   type: 'error',
        //   duration: 5 * 1000
        // });
      }
    } else {
      let message = error.message;
      if (error.response && error.response.data) {
        message = error.response.data;
        const status = error.response.status;
        if (status === 401) {
        } else {
          Vue.prototype.$LayerTips({content:'访问数据出错',time:2000});
        }
      }
    }
    return Promise.reject(error);
  }
);

export default service;
