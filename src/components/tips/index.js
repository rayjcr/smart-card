import Vue from 'vue'
import LayerTips from './tips.vue'

const Tips = Vue.extend(LayerTips)                      //Vue实例构造器,用来生成组件

Tips.install = function (options, type) {               //options  父组件的传参
    if (options === undefined || options === null) {
        options = {
            content: ''
        }
    } else if (typeof options === 'string' || typeof options === 'number') {
        options = {
            content: options
        }
        if (type != undefined && options != null) {
            options.type = type;
        }
    }

    let instance = new Tips({                           //创建 Tips 实例，并挂载到一个元素上。  在实例挂载之后，元素可以用 vm.$el 访问。
        data: options
    }).$mount()                                     //手动挂载

    document.body.appendChild(instance.$el)   

    Vue.nextTick(() => {            // DOM 更新了
        instance.visible = true
    })
}

export default Tips