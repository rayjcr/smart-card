<template>
    <div class="mainFrame appabs" ref="restartTime">
        <div class="frameHead">
            <div class="leftHead">
                <div class="backPage" @click="backHome">商城</div>
            </div>
            <div class="punishCard" @click="openPunish" v-if="isLimit">
                <div class='punishTit'>惩罚卡:</div>
                <div class="punishList">
                    <div class="cardbox" v-for="(item,index) in punishList">
                        <img :src="item.icon">
                    </div>
                </div>
            </div>
            <div class="myCoin">
                <div class="coinNum">可用：{{medalNum}}</div>
            </div>

            <div class="rightHead">
                <div class="info"><span>{{userName}}</span><span>{{className}}</span><span @click="backHome">退出({{countDown}}s)</span></div>
            </div>
        </div>
        <div class="frameBody">
            <div class="navMain">
                
                <div class="scrollNav">
                    <div class="nav" :class="{'cur':isAllType}" @click="checkAll()">
                        <span>全部</span>
                    </div>
                    <div class="nav" :class="{'cur':item.ischeck}" v-for="(item,index) in goodsTypeList" :key="index" @click="checkType(item)">
                        <span>{{item.name}}</span>
                    </div>
                </div>

                <div class="myOrder" @click="myOrder"><span>我的订单</span></div>

            </div>

            <div class="contMain" ref="scrollGoods">
                <transition name="fadeIn">
                    <div class="goodsList"  ref="goodsList" v-show="!isLoad">
                        <div class="goodsUnit" :class="{'limit':isLimit}" v-for="(item,index) in goodsList" :key="index">
                            <div class="goodsImg">
                                <img :src="item.picture">
                            </div>
                            <div class="goodsTit">
                                {{item.name}}
                                <span class="surplus">剩余{{item.reserve}}件</span>
                            </div>
                            <div class="goodsExchange">
                                <span class="icon">{{item.price}}</span>
                                <div class="exchageBtn" @click="exchangeGoods(item)">兑换</div>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>


        </div>


        <div class="mask"  @click="cancelLayer" v-show="isMask"></div>

        <transition name="sliderRight">
            <div class="punishConfirmDialog" v-show="punishconfirmLayer">
                <div class="punishTit">抵消确认</div>
                <div class="punishCont">
                    <div class="row">
                        <div class="tit">抵消<span>[{{curCardItem.name}}]</span>数量</div>
                        <div class="num">
                            <div class="subtraction" @click="subtraction">-</div>
                            <div class="numText">{{exchangeNum}}</div>
                            <div class="plus" @click="plus">+</div>
                        </div>
                    </div>
                    <div class="row">
                        <div  class="xhTips">需要消耗<span>{{exchangeNum*curCardItem.number}}</span>勋章，确认抵消？</div>
                    </div>
                </div>
                <div class="layerBtn">
                    <div class="cancelBtn" @click="closeDialog">取消</div>
                    <div class="confirmBtn" @click="submitPunish">确定</div>
                </div>
            </div>
        </transition>

        <transition name="sliderRight">
            <div class="punishDialog" v-show="punishLayer">
                <div class="punishTit">惩罚卡</div>
                <div class="punishCont">
                    <div class="cardbox" v-for="(item,index) in punishList" @click="punishConfirm(item)">
                        <div class="cardImg">
                            <img :src="item.icon">
                        </div>
                        <div class="cardTit">
                            <div class="tit">
                                <span class="name canDeduction" :class="{'no':item.canDeduction==0}">{{item.name}}</span>
                                
                            </div>
                            <div class="num">x{{item.count}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <transition name="fadeIn">
        <div class="layerOrder" v-show="orderDialog">
            <div class="layerClose" @click="closeDialog"></div>
            <div class="layerTit">兑换确认</div>
            <div class="layerCont">确认兑换<span>{{curGoods.name}}</span>?
            <div v-if="curGoods.price>medalNum" class="warningTips">余额不足，请继续努力</div>
            </div>
            <div class="layerBtn">
                <div class="cancelBtn" @click="closeDialog">取消</div>
                <div class="confirmBtn" :class="{'disable':curGoods.price>medalNum}" @click="submitBuy">确定</div>
            </div>
        </div>
        </transition>

        <transition name="sliderRight">
            <div class="waitDialog" v-show="waitLayer">
                <div class="waitTit">请刷学生卡</div>
                <div class="waitGif">
                    <img :src="stateImgUrl">
                </div>
            </div>
        </transition>

        <transition name="sliderRight">
            <div class="exchangeResult" v-show="isResult">
                <div class="resultContent" :class="[isErr?'err':'right']">{{isErr?'兑换失败':'兑换成功'}}</div>
            </div>
        </transition>


    </div>
</template>

<script>
import {setTokenTime,clearTime} from '@/utils/comm'
import * as api from '@/api/api';
export default {
    data(){
        return{
            stateImgUrl:'./static/img/identityCard.gif',
            isMask:false,
            orderDialog:false,
            isLoad:false,
            isAllType:true,
            goodsTypeList:[],
            goodsTotle:0,
            goodsLimit:20,
            goodsCurPage:1,
            goodsList:[],
            punishList:[],
            curTypeId:"0",
            curGoods:{},
            medalNum:0,
            waitLayer:false,
            isResult:false,
            isErr:false,
            punishLayer:false,
            punishconfirmLayer:false,
            curCardItem:{},
            exchangeNum:1,
            userName:"",
            className:"",
            countDown:0,
            isLimit:false,
            timeoutObj:null,
        }
    },
    computed: {
        errState () {
            return this.$store.getters.errorState;　　//
        },
        checkComplete () {
            return this.$store.getters.checkComplete;　　//
        },
    },
    destroyed(){
        clearTimeout(this.timeoutObj)
    },
    watch: {
        errState:function(errState) {
            //do something
            // console.log(errState,"errState")
            if(errState){
                console.log("哇错误~~~~")
                this.isErr = true;
                this.errExchange();
                this.$store.dispatch("SetErrorState",false);
            }
        },
        checkComplete:function(isComplete){
            // console.log(isComplete,"isComplete")
            if(isComplete){
                console.log("这里调用兑换的方法")
                this.$store.dispatch("SetCheckComplete",false);
                this.completeExchange();
                // this.checkUser();
                
            }
        },
    },
    mounted(){
        //eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxNTQ0OTk5IiwidXNlcklkIjoiOGM0NjdlYTc5M2RkNDRhZDk5ZTc1ZDc0ZmJjM2I3NjEiLCJ1c2VyTmFtZSI6IuWFrOS8l-WPt-a8lOekuuWtpuagoSIsInh4ZG0iOiIxNTQ0IiwidHlwZSI6IjIiLCJleHBpcmUiOjE1ODUwMzQ4MjMzNjR9.eaD0hzC8lU6QlzM9ZYPGwHyRpcECw3pVabrbpr9-Eaq9Bms1jGwU1jXV_MVMFjyoI1NuFqWJGGYXwOG8NpMo6yqFTVUV2G6cLiTez9e-yPIAD9t8S_prHP35Wfn1urDvl4HZawubj4NQBG26NDzYrqnfW3tnNyNsvYtmszaIUMQ
        this.init();
        this.$refs.restartTime.addEventListener('mousedown',this.restartTime)
        this.$refs.scrollGoods.addEventListener('scroll',this.checkScroll)
    },
    methods:{
        async init(){
            // let optres = await api.canUse();
            this.userName = window.localStorage.getItem("card_username");
            this.className = window.localStorage.getItem("className");
            // setTokenTime();
            this.countDown = window.countDownTime;
            this.countDownInterval();

            this.getGoodsTypeList();
            this.getGoodsList();
            this.getUserMedal();

            //获取抵消卡列表
            this.getRemindVOList();
        },
        countDownInterval(){
            this.timeoutObj = setTimeout(()=>{
                this.countDown--;
                if(this.countDown>0){
                    this.countDownInterval();
                }else{
                    this.backHome();
                }
            },1000)
        },
        /**
         * 获取抵消卡列表
         */
        async getRemindVOList(){
            let res = await api.getRemindVOList({studentId:window.localStorage.getItem("card_oauserid")});
            this.punishList = res.value;
            this.isLimit = this.punishList.length==0?false:true
            // this.punishList = this.punishList.concat(this.punishList).concat(this.punishList)
            // console.log(res,"抵消卡列表");
        },
        async getUserMedal(){
            let res = await api.getUserMedalInfo({userId:window.localStorage.getItem("card_oauserid")});
            // console.log(res,"res用户勋章")
            this.medalNum = res.value.copyMedalNum
        },
        async getGoodsTypeList(){
            var res = await api.getGoodsTypeList({schoolCode:window.localStorage.getItem('xxdm')});
            if(res.resultCode==1){
                this.goodsTypeList = res.value
                this.cancelTypeCheck();
            }else{
                Vue.prototype.$LayerTips({content:'加载信息出错',time:2000});
            }
            // console.log(res,"res")
        },
        cancelTypeCheck(){
            for(let i=0;i<this.goodsTypeList.length;i++){
                this.$set(this.goodsTypeList[i],'ischeck',false)
            }
        },
        checkAll(){
            this.isAllType = true;
            this.curTypeId = 0;
            this.cancelTypeCheck();
            this.goodsCurPage = 1;
            this.goodsList = [];
            this.getGoodsList();
        },
        checkType(item){
            this.isAllType = false;
            this.curTypeId = item.id;
            this.cancelTypeCheck();
            this.$set(item,'ischeck',true);
            this.goodsCurPage = 1;
            this.goodsList = [];
            this.getGoodsList();
        },
        async getGoodsList(){
            this.isLoad = true
            let param = {};
            param.typeId = this.curTypeId=="0"?'':this.curTypeId;
            param.limit = this.goodsLimit;
            param.name = '';
            param.page = this.goodsCurPage;
            var res = await api.getGoodsListPage(param);
            this.goodsTotle = res.value.totalCount;
            this.goodsList.push.apply(this.goodsList,res.value.dataList);
            this.checkScroll()
            // console.log(res,"商品列表");
        },
        checkScroll(){
            this.restartTime();
            let scrollTop = this.$refs.scrollGoods.scrollTop;
            let boxHeight = this.$refs.scrollGoods.clientHeight;
            let scrollHeight = this.$refs.scrollGoods.scrollHeight;
            
            // console.log(scrollTop,boxHeight,scrollHeight)

            if(this.goodsCurPage<Math.ceil(this.goodsTotle/this.goodsLimit)&&((scrollTop+boxHeight+100)>scrollHeight)){
                this.goodsCurPage++;
                this.getGoodsList();
            }else{
                this.isLoad = false
            }
        },
        myOrder(){
            this.restartTime();
            this.$router.push({path:'order'});
        },
        exchangeGoods(item){
            this.isMask = true;
            this.orderDialog = true;
            this.curGoods = item;
            this.$store.dispatch("SetCheckComplete",false);
            // console.log(this.curGoods,"this.curGoods")
        },
        closeDialog(){
            this.isMask = false;
            this.orderDialog = false;
            this.punishLayer = false;
            this.punishconfirmLayer = false;
        },
        openPunish(){
            this.isMask = true;
            this.punishLayer = true;
        },
        backHome(){
            this.$router.push({path:'/index'})
        },
        submitBuy(){
            // 如果价格大于可用余额 直接跳出
            if(this.curGoods.price>this.medalNum){
                return false
            }
            this.$store.dispatch("SetConfirmExchange",true);
            this.$store.dispatch("SetSwipeState",1);
            // console.log(this.$store.getters.swipeState,"当前状态");
            this.isMask = true;
            this.waitLayer = true;
        },
        errExchange(){
            this.$store.dispatch("SetConfirmExchange",false);
            this.orderDialog = false;
            this.waitLayer = false;
            this.isResult = true;

        },
        cancelLayer(){
            this.waitLayer = false;
            this.isMask = false;
            this.orderDialog = false;
            this.isResult = false;
            this.punishconfirmLayer = false;
            this.punishLayer = false;
            this.$store.dispatch("SetCheckComplete",false);  
        },
        async completeExchange(){
            let params = {};
            params.device = 3;
            params.goodsId = this.curGoods.id;
            params.schoolCode = window.localStorage.getItem('xxdm');
            params.stuNo = window.localStorage.getItem("card_oauserid");
            let res = await api.exchange(params);
            if(res.resultCode == 1){
                this.isErr = false;
                this.isResult = true;
                this.waitLayer = false;
                this.orderDialog = false;
                this.getUserMedal();
            }else{
                this.$store.dispatch("SetErrorState",true);
            }
            this.$store.dispatch("SetConfirmExchange",false);
            this.restartTime();
            // console.log(res,"兑换RES");
        },
        punishConfirm(item){
            this.curCardItem = item;
            this.punishLayer = false;
            this.punishconfirmLayer = true;
        },
        subtraction(){
            // console.log("this.exchangeNum")
            if(this.exchangeNum<=1){
                this.exchangeNum = 1;
            }else{
                this.exchangeNum--;
            }
        },
        plus(){
            // console.log("this.exchangeNum")
            if(this.exchangeNum>=this.curCardItem.count){
                this.exchangeNum = this.curCardItem.count;
            }else{
                this.exchangeNum++;
            }
        },
        async submitPunish(){
            let that = this;
            let params = {}
            params.studentId = window.localStorage.getItem("card_oauserid");
            params.num = this.exchangeNum;
            params.evaluationId = this.curCardItem.id;
            let res = await api.deductionByEvaluation(params);
            console.log(res,"抵消卡res");
            if(res.resultCode == 1){
                this.closeDialog();
                this.getRemindVOList();
                setTimeout(function(){
                    that.getUserMedal()
                },1000)
                this.$LayerTips({content:'抵消完成',time:1000});
            }else{
                this.$LayerTips({content:res.resultMessage,time:2000});
            }
            this.restartTime();
        },
        restartTime(){
            console.log(window.countDownTime,"window.countDownTime");
            this.countDown = window.countDownTime;
            // setTokenTime();
        },
        /**
         * 清空缓存并返回首页
         */
        async backHome(){
            let optres = await api.noUse();
            window.localStorage.removeItem("token");
            this.$store.dispatch("SetSwipeState",0);  
            this.$store.dispatch("SetSwallowState",0);
            this.$store.dispatch("SetConfirmExchange",false);
            clearTime();
            this.$router.push({'path':'/'})
        },
    }
}
</script>

<style lang='scss' scoped>
.mainFrame{
    width: 100%;
    height: 100%;
    background: #EFF2F3FF;
    display: flex;
    flex-direction: column;
}
.frameHead{
    background: #754AEC; 
    width: 100%;
    height: .9rem;
    .leftHead{
        float: left;
        margin: .23rem;
        .backPage{
            height: .44rem;
            line-height: .44rem;
            background: url(../assets/img/arrow-left.png) no-repeat left center;
            font-size: .36rem;
            color: #FFF;
            padding-left: .55rem;
        }
    }
    .myCoin{
        float: left;
        margin-left: .4rem;
        .coin,.coinNum{
            font-size: .24rem;
            color: #FFF;
        }
        .coinNum{
            background: url(../assets/img/dot-xz.png) no-repeat left center;
            background-size: auto 60%;
            font-size: .32rem;
            padding-left: .6rem;
            margin-right: .4rem;
            height: .9rem;
            line-height: .9rem;
        }
    }
    .punishCard{
        float: left;
        line-height: .9rem;
        color: #FFF;
        margin-left: .5rem;
        .punishTit{
            float: left;
        }
        .punishList{
            float: left;
            padding: .15rem 0;;
            .cardbox{
                float: left;
                margin: .1rem;
                width: .88rem;
                height: .4rem;
                position: relative;
                border-radius: .1rem;
                overflow: hidden;
                img{
                    position: absolute;
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
    .rightHead{
        float: right;
        font-size: .34rem;
        padding-right: .4rem;
        font-size: .34rem;
        color: #FFF;
        line-height: .9rem;
        .info{
            span{
                margin: 0 10px;
            }
        }
        >div{
            display: inline-block;
        }
        .myorder{
            width: 1.2rem;
            height: .48rem;
            line-height: .48rem;
            border-radius: .1rem;
            background: #FFF;
            font-size: .24rem;
            color: #4385EEFF;
            text-align: center;
        }
    }
}
.frameBody{
    flex: 1;
    overflow: hidden;
    display: flex;
}
.navMain{
    width: 3rem;
    height: 100%;
    overflow:hidden;
    display: flex;
    flex-direction: column;
    // overflow: auto;
    // overflow-x:hidden;
    .scrollNav{
        width: 3rem;
        background: #FFF;
        overflow: auto;
        flex: 1;
    }
    .myOrder{
        width:100%;
        height: 1rem;
        line-height: 1rem;
        text-align: center;
        background: #FFF;
        border-top: 1px solid #d6d6d6;
        span{
            font-size: .32rem;
            background: url(../assets/img/dot-order.png) no-repeat left center;
            padding:.2rem 0 .2rem .55rem;
        }
    }
    // overflow-x:visible;
    .nav{
        font-size: .32rem;
        color: #ccc;
        width: 100%;
        height: 1rem;
        padding-left: .5rem;
        line-height: 1rem;
        position: relative;
        span{
            position: relative;
            // font-weight: bold;
            z-index: 2;
        }
    }
    .nav.cur{
        color: #262626;
        font-weight: bold;
    }
    .nav.cur::after{
        content: '\20';
        width: .08rem;
        height: .4rem;
        position: absolute;
        z-index: 1;
        background: #754AEC;
        border-radius: .04rem;
        top:.3rem;
        left: .2rem;
    }
}
.contMain{
    flex: 1;
    height: 100%;
    overflow: auto;
    padding-bottom: .4rem;
}
.goodsList{
    float: left;
    .goodsUnit{
        width: 3.5rem;
        height: 3.8rem;
        position: relative;
        background: #FFF;
        border-radius: .1rem;
        float: left;
        margin: .4rem .2rem 0 .2rem;
        padding: .1rem;
        .goodsImg{
            width: 100%;
            height: 2.2rem;
            border-radius: .1rem;
            position: relative;
            overflow: hidden;
            background: #f2f2f2;
            img{
                max-width: 100%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%,-50%);
            }
        }
        .goodsTit{
            width: 100%;
            margin: .3rem 0;
            font-size: .32rem;
            color: #262626;
            position: relative;
            line-height: .36rem;
            font-weight: bold;
            .surplus{
                position: absolute;
                font-weight:normal;
                color: #B3B3B3;
                font-size: .22rem;
                right: 0;
                top: 0;
            }
        }
        .goodsExchange{
            width: 100%;
            position: relative;
            .icon{
                background: url(../assets/img/dot-xz.png) no-repeat left center;
                background-size: auto 100%;
                font-size: .32rem;
                line-height: .32rem;
                padding: .05rem 0 .05rem .55rem;
                font-weight: bold;
            }
            .exchageBtn{
                width: 1.1rem;
                height: .45rem;
                border-radius: .23rem;
                background: #754AEC;
                position: absolute;
                top: -.05rem;
                right: .1rem;
                font-size: .22rem;
                color: #FFF;
                line-height: .45rem;
                text-align: center;
            }
        }
    }
    .goodsUnit.limit:after{
        content: '\20';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: .1rem;
        background: rgba($color: #000000, $alpha: .5);
        top: 0;
        left:0;
        z-index: 10;
    }
    .goodsUnit.limit:before{
        content: '限制兑换';
        position: absolute;
        font-size: .36rem;
        color: #FFF;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        z-index: 15;
    }
}
.layerOrder{
    width: 8rem;
    padding: .4rem;
    border-radius: .2rem;
    background: #FFF;
    position: absolute;
    z-index: 900;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    .layerTit{
        font-size: .48rem;
        width: 100%;
        text-align: center;
        padding: .4rem 0;
        line-height: .48rem;
        font-weight: bold;
    }
    .layerCont{
        padding: .4rem 0;
        font-size: .36rem;
        width: 100%;
        text-align: center;
        position: relative;
        span{
            color: #33a5ff;
        }
        .warningTips{
            position: absolute;
            font-size: .24rem;
            color: #FF7B12;
            width: 100%;
            bottom: -.2rem;
            text-align: center;
        }
    }
    .layerBtn{
        width: 100%;
        margin-top: .6rem;
        text-align: center;
        .cancelBtn,.confirmBtn{
            width: 2rem;
            height: .8rem;
            border-radius: .4rem;
            font-size: .32rem;
            color: #FFF;
            line-height: .8rem;
            text-align: center;
            display: inline-block;
            margin:0 .2rem;
        }
        .cancelBtn{
            background: #B6B8B8;
        }
        .confirmBtn{
            background: #754AEC;
        }
        .confirmBtn.disable{
            background: #B6B8B8;
        }
    }
    .layerClose{
        width: .5rem;
        height: .5rem;
        position: absolute;
        top: .2rem;
        right: .2rem;
        background: url(../assets/img/dot-close.png) no-repeat center ;
        background-size: 100% 100%;
        transition: .2s all;
    }
    .layerClose:active{
        transform:rotate(180deg);
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
    .waitTit{
        width: 100%;
        font-size: .48rem;
        color: #444;
        text-align: center;
        font-weight: bold; 
        height: 1.2rem;
        line-height: 1.4rem;
    }
    .waitGif{
        height: 5rem;
        width: 100%;
        text-align: center;
        img{
            height: 100%;
        }
    }
}

.punishDialog{
    width: 12rem;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top:-3.5rem;
    margin-left:-6rem;
    background: #FFF;
    border-radius: .2rem;
    z-index: 999;
    overflow: hidden;
    text-align: center;
    .punishTit{
        width: 100%;
        font-size: .48rem;
        color: #444;
        text-align: center;
        font-weight: bold; 
        height: 1.2rem;
        line-height: 1.4rem;
    }
    .punishCont{
        height: 5.5rem;
        overflow: auto;
        width: 100%;
        float: left;
    }
    .cardbox{
        margin:.2rem .25rem;
        float: left;
        width: 3.5rem;
        height:2.2rem;
        .cardImg{
            width: 100%;
            height: 1.6rem;
            position: relative;
            border-radius: .4rem;
            overflow: hidden;
            img{
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
            }
        }
        .cardTit{
            font-size: .24rem;
            padding-top: .2rem;
            .tit{
                float: left;
                .name,.canDeduction{
                    float: left;
                    display: inline-block;
                }
                .name{
                    max-width: 2rem;
                    font-weight: bold;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    position: relative;
                }
                .canDeduction::after{
                    content: '\20';
                    width: .8rem;
                    height: .28rem;
                    background: url(../assets/img/dx.png) no-repeat;
                    background-size: 100% 100%;
                    position: absolute;
                    right: -1rem;
                    top: .05rem;
                }
                .canDeduction.no::after{
                    content: '\20';
                    background: url(../assets/img/dx-no.png) no-repeat;
                    background-size: 100% 100%;
                }
            }
            .num{
                float: right;
            }
        }
    }
}

.punishConfirmDialog{
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
    .punishTit{
        width: 100%;
        font-size: .48rem;
        color: #444;
        text-align: center;
        font-weight: bold; 
        height: 1.2rem;
        line-height: 1.4rem;
    }
    .punishCont{
        width: 100%;
        float: left;
        padding: .2rem .5rem .4rem;
        .row{
            float: left;
            width: 100%;
            padding-bottom: .5rem;
            .xhTips{
                width: 100%;
                font-size: .36rem;
                color: #262626;
                float: left; 
                text-align: left;
            }
            .tit{
                font-size: .36rem;
                color: #262626;
                float: left;
                span{
                    color: #33A5FF;
                }
            }
            .num{
                float: right;
                .subtraction,.numText,.plus{
                    float: left;
                    height: .6rem;
                    width: .6rem;
                    line-height: .6rem;
                    text-align: center;
                }
                .subtraction,.plus{
                    line-height: .58rem;
                    font-size: .4rem;
                    border: 1px solid #D2D5D9;
                }
                .numText{
                    width: 1.2rem;
                    background: #ECEEF1;
                }
            }
        }
    }
    .layerBtn{
        width: 100%;
        padding-bottom: .4rem;
        text-align: center;
        .cancelBtn,.confirmBtn{
            width: 2rem;
            height: .8rem;
            border-radius: .4rem;
            font-size: .32rem;
            color: #FFF;
            line-height: .8rem;
            text-align: center;
            display: inline-block;
            margin:0 .2rem;
        }
        .cancelBtn{
            background: #B6B8B8;
        }
        .confirmBtn{
            background: #33A5FF;
        }
    }
}

.exchangeResult{
    width: 6rem;
    height: 3rem;
    padding:1rem 0;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top:-1.5rem;
    margin-left:-3rem;
    background: #FFF;
    border-radius: .2rem;
    z-index: 999;
    overflow: hidden;
    text-align: center;
    .resultContent{
        font-size: .42rem;
        color: #444;
        text-align: center;
        font-weight: bold; 
        display: inline;
        line-height: 1rem;
        padding-left: .8rem;
    }
    .resultContent.err{
        background: url(../assets/img/doterror.png) no-repeat left center;
        background-size: auto 100%;
    }
    .resultContent.right{
        background: url(../assets/img/dot-right.png) no-repeat left center;
        background-size: auto 100%;
    }
}

</style>