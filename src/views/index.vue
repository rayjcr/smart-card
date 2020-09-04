<template>
    <div class="indexPage appabs">
        <div class="appTit">综合素质</div>
        <div class="appBox">
            <div class="appUnit app_1" @click="exchange">
                <div class="appIcon">
                </div>
                <div class="btnIcon"></div>
            </div>
            <div class="appUnit app_2" @click="mallshop">
                <div class="appIcon">
                </div>
                <div class="btnIcon"></div>
            </div>
        </div>


            <div class="mask" @click="cancelLayer" v-show="isMask"></div>


            <transition name="sliderRight">
                <div class="waitDialog" v-show="waitLayer">
                    <div class="waitTit">请刷学生卡</div>
                    <div class="waitGif">
                        <img :src="stateImgUrl">
                    </div>
                </div>
            </transition>

            <transition name="sliderRight">
                <div class="waitDialog" v-show="exChangeLayer" @click="errorExchange">
                    <div class="exchangeTit">请插入卡片兑换</div>
                    <div class="waitGif">
                        <img :src="exchageImgUrl">
                    </div>
                </div>
            </transition>

            <transition name="sliderRight">
                <div class="waitDialog" v-show="exChangeErrLayer" @click="againExchange">
                    <div class="exchangeTit">请刷有效学生卡</div>
                    <div class="errorInfo"><span>无效卡</span></div>
                    <div class="waitGif error">
                        <img :src="exchageImgUrl">
                    </div>
                </div>
            </transition>

            <transition name="sliderRight">
                <div class="waitDialog" v-show="exChangeSuccessLayer">
                    <div class="exchangeTit">兑换成功</div>
                    <div class="successInfo">{{exChangeResult.rewardType==1?'分数':'勋章'}}  <span>+{{exChangeResult.rewardNum}}</span></div>
                    <div class="waitGif successGif">
                        <img :src="exchageImgUrl">
                    </div>
                    <div class="exchangeBtn">
                        <div class="againExchange" @click="againExchange">继续兑卡</div>
                    </div>
                </div>
            </transition>

    </div>
</template>

<script>
import * as api from '@/api/api';
import {setTokenTime,clearTime} from '@/utils/comm'
export default {
    data(){
        return {
            stateImgUrl:'./static/img/identityCard.gif',
            exchageImgUrl:'./static/img/plugInCard.gif',
            waitLayer:false,
            exChangeLayer:false,
            exChangeSuccessLayer:false,
            exChangeErrLayer:false,
            isMask:false,
            operate:'',
            exChangeResult:{},
        }
    },
    computed: {
        errState () {
            return this.$store.getters.errorState;　　//
        },
        swipeComplete () {
            return this.$store.getters.swipeComplete;　　//
        },
        swallowComplete () {
            return this.$store.getters.swallowComplete;　　//
        },
    },
    watch: {
        errState:function(errState) {
            //do something
            console.log(errState,"errState---96")
            if(errState){
                this.errCancel();
                this.$store.dispatch("SetErrorState",false);
            }
        },
        swipeComplete:function(isComplete){
            console.log(isComplete,"isComplete")
            if(isComplete){
                switch(this.operate){
                    case 'Recharge':
                        this.againExchange();
                        break
                    case 'ToMall':
                        this.mallshop();
                        break
                }
                this.$store.dispatch("SetSwipeComplete",false);
            }
        },
        swallowComplete:function(isComplete){
            if(isComplete){
                this.checkCard(window.localStorage.getItem("card_No"));
            }
        },
    },
    mounted(){
        clearTime();
    },
    methods:{
        errCancel(){
            this.waitLayer = false;
            this.exChangeSuccessLayer = false;
            this.exChangeErrLayer = false;
            this.exChangeLayer = false;
            this.isMask = false;
            this.$store.dispatch("SetSwipeState",0);  
            this.$store.dispatch("SetSwallowState",0);  
        },
        async checkCard(cardNo){
            let params = {};
            params.cardNumber = cardNo
            params.classCode = window.localStorage.getItem("classId");
            params.className = window.localStorage.getItem("className");
            params.gradeCode = window.localStorage.getItem("gradeId");
            params.schoolCode = window.localStorage.getItem('xxdm');
            params.userId = window.localStorage.getItem('card_oauserid');
            params.userName =window.localStorage.getItem('card_username');
            let res = await api.atmRecordSave(params);
            if(res.resultCode==1){
                this.exChangeResult = res.value
                let intoRes = await api.intocard();
                this.successExchange();
            }else{
                let intoRes = await api.outcard();
                this.errorExchange();
            }
            let optres = await api.noUse();
            this.$store.dispatch("SetSwallowComplete",false);
            console.log(res,"兑换成功")
        },
        exchange(){

            // 如果cookie里存有用户信息 直接跳充值等待弹层
            console.log(window.localStorage.getItem("token"),"token")
            if(window.localStorage.getItem("token")){
                this.againExchange();
            }else{
                // 如果没有记录用户状态，打开等待身份识别串口状态
                this.$store.dispatch("SetSwipeState",1);  
                this.isMask = true;
                this.waitLayer = true;
                this.operate = 'Recharge';
            }

            // setTimeout(function(){
            //     that.againExchange();
            // },2000)
        },
        async againExchange(){
            
            // let optres = await api.canUse();
            // console.log(window.localStorage.getItem('token'),"window.localStorage.getItem('token')")
            if(!window.localStorage.getItem('token')){
                this.cancelLayer();
                this.$LayerTips({content:'用户已过期',time:2000});
                return false
            }
            this.$router.push({'path':'/exchange'})

            // this.isMask = true;
            // this.waitLayer = false;
            // this.exChangeSuccessLayer = false;
            // this.exChangeErrLayer = false;
            // this.exchageImgUrl = './static/img/plugInCard.gif';
            // this.exChangeLayer = true;
        },
        async mallshop(){
            // let res = await this.$parent.getTokenTest();
            // if(res){
            //    this.$router.push({path:'/mall'})
            // }
            // 以下是正式上的刷卡代码
            if(window.localStorage.getItem("token")){
                this.$router.push({path:'/mall'})
            }else{
                this.$store.dispatch("SetSwipeState",1);  
                console.log(this.$store.getters.swipeState,"当前状态")
                let that = this;
                this.isMask = true;
                this.waitLayer = true;
                this.operate = 'ToMall';
            }
            
        },
        successExchange(){
            this.exChangeLayer = false;
            this.exchageImgUrl = './static/img/exchangeCard.gif';
            this.exChangeSuccessLayer = true;
        },
        errorExchange(){
            this.exChangeLayer = false;
            this.exchageImgUrl = './static/img/errorInfo.png';
            this.exChangeErrLayer = true;
        },
        async cancelLayer(){
            let intoRes = await api.outcard();
            let optres = await api.noUse();
            this.$store.dispatch("SetSwipeState",0);  
            this.$store.dispatch("SetSwallowState",0);
            this.$store.dispatch("SetSwallowComplete",false);
            this.$store.dispatch("SetSwipeComplete",false);
            this.isMask = false;
            this.exChangeLayer = false;
            this.waitLayer = false;
            this.exChangeSuccessLayer = false;
            this.exChangeErrLayer = false;
        },
    }
}
</script>

<style lang='scss' scoped>
.indexPage{
    width: 100%;
    height: 100%;
    background: url(../../static/img/mainbg.png) no-repeat;
    background-size: 100% 100%;
    // position: relative;
}
.appTit{
    position: absolute;
    width: 100%;
    top: .4rem;
    left: .6rem;
    font-size: .55rem;
    line-height: .85rem;
    height: .85rem;
    text-align: left;
    color: #FFF;
    font-weight: bold;
    background: url(../assets/img/logo.png) no-repeat left center;
    background-size: auto 100%;
    padding-left: 1.2rem;
}
.appBox{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    width: 100%;
    text-align: center;
    .appUnit{
        width: 5rem;
        height: 7rem;
        display: inline-block;
        background: #FFF;
        border-radius: .4rem;
        margin: 0 .5rem;
        transition: .3s all;
    }
    .appIcon{
        width: 100%;
        margin: .8rem 0;
        height: 2.4rem;
        padding-left: 2.9rem;
        font-size: .8rem;
        color: #FFF;
        font-weight: bold;
        line-height: 2.4rem;
        text-align: left;
    }
    .app_1{
        background:linear-gradient(180deg,rgba(255,155,155,1) 0%,rgba(255,255,255,1) 100%);
        box-shadow:0px 31px 60px rgba(0,0,0,0.18);
        .appIcon{
            height: 2.4rem;
            width: 2.4rem;
            background: url(../assets/img/dot-dh.png) no-repeat center;
            background-size: 100% 100%;
            margin: 1.6rem auto 0;
        }
        .btnIcon{
            width: 4.66rem;
            height: 1.66rem;
            background: url(../assets/img/btn-dh.png) no-repeat center;
            background-size: 100% 100%;
            margin: 1rem auto 0;
        }
    }
    .app_2{
        background:linear-gradient(180deg,rgba(183,154,255,1) 0%,rgba(255,255,255,1) 100%);
        box-shadow:0px 31px 60px rgba(0,0,0,0.18);
        .appIcon{
            height: 2.4rem;
            width: 2.4rem;
            background: url(../assets/img/dot-sc.png) no-repeat center;
            background-size: 100% 100%;
            margin: 1.6rem auto 0;
        }
        .btnIcon{
            width: 4.66rem;
            height: 1.66rem;
            background: url(../assets/img/btn-sc.png) no-repeat center;
            background-size: 100% 100%;
            margin: 1rem auto 0;
        }
    }
    .app_1:active,.app_2:active{
        transform: scale(.95);
    }
}
.waitCardLayer{
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 200;
}
.exchangeTit{
    width: 100%;
    font-size: .48rem;
    color: #444;
    text-align: center;
    font-weight: bold; 
    height: 1.2rem;
    line-height: 1.4rem;
}
.waitTit{
    width: 100%;
    font-size: .48rem;
    color: #444;
    text-align: center;
    font-weight: bold; 
    height: 1.2rem;
    padding-top: .6rem;
    // line-height: 1.2rem;
}
.waitGif{
    height: 6rem;
    width: 100%;
    text-align: center;
    img{
        height: 100%;
    }
}
.waitGif.error{
    padding:.5rem 0 1rem;
}
.successGif{
    height: 3rem;
}
.successInfo{
    font-size: .36rem;
    height: .6rem;
    line-height: .6rem;
    font-weight: bold;
    color: #444;
    span{
        color: #33A5FFFF;
    }
}
.errorInfo{
    width: 100%;
    margin-top: .5rem;
    text-align: center;
    span{
        background: url(../assets/img/doterror.png) no-repeat left center;
        background-size: auto 100%;
        font-size: .36rem;
        font-weight: bold;
        color: #969899FF;
        padding-left: .6rem;
    }
}
.exchangeBtn{
    width: 100%;
    padding:.4rem 0;
    text-align: center;
    .againExchange{
        display: inline-block;
        width: 2rem;
        height: .8rem;
        border-radius: .4rem;
        background: #33A5FFFF;
        font-size: .32rem;
        color: #FFF;
        line-height: .8rem;
    }
}
.waitDialog{
    width: 9rem;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top:-3.5rem;
    margin-left:-4.5rem;
    background: #FFF;
    border-radius: .2rem;
    z-index: 999;
    overflow: hidden;
    text-align: center;
    // img{
    //     margin-top: .6rem;
    //     height: 5.4rem;
    // }
}
</style>