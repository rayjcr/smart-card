
import LayerTips from '@/components/tips';



import Vue from 'vue'
const components = [
]

const install = function(Vue, opts = {}) {
    // components.forEach(component => {
    //     Vue.component(component.name, component);
    // });

    Vue.prototype.$LayerTips = LayerTips.install
};


// if (typeof window !== 'undefined' && window.Vue) {
//     install(window.Vue);
// }
install(Vue);

// import LayerTips from '@/components/tips/index.js';
// export default LayerTips;
