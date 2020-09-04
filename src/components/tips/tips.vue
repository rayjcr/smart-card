<template>
    <div class="tipsBox">
        <transition name="tips" @after-leave="handleAfterLeave">
            <div class="hDialog" v-show="visible">
                <div v-html="content"></div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: "MyMessage",
    data() {
        return {
            content: '',
            time: 3000,
            visible: false,
            // isClass:'',
        }
    },
    mounted() {
        if(this.time!=0){
            this.close()
        }
    },
    methods: {
        handleAfterLeave() {
            this.$destroy(true);                        //完全销毁一个实例。清理它与其它实例的连接，解绑它的全部指令及事件监听器。
            this.$el.parentNode.removeChild(this.$el);
        },
        close() {
            window.setTimeout(() =>{
                this.visible = false
            }, this.time);
        }
    }
}
</script>
<style lang="scss" scoped>
.tipsBox{
    width:100%; 
    height:100%;
    top:0;
    left:0;
    position:fixed;
    z-index:500;
    background:rgba(0, 0, 0, .6);
    display: flex;//flex布局
    justify-content: center;//x轴排列
    align-items: center;//y轴排列
}
.hDialog{
    // width:60%;
    min-width: 30%;
    padding: .4rem .2rem;
    line-height: 2em;
    background: #FFF;
    box-shadow: 0 0 .05rem rgba(0, 0, 0, .1);
    position: fixed;
    z-index: 550;
    // top:50%;
    // left: 50%;
    // transform: translate(-50%,-50%);
    text-align: center;
    font-size: .34rem;
    color: #262626;
    border-radius: .2rem;
}
.tips-enter-active {
    animation-name: fadeInRight;
    animation-duration: .5s;
}

.tips-leave-active {
    animation-name: fadeOutLeft;
    animation-duration: 1s;
}
</style>
