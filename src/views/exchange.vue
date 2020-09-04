<template>
    <div class="mainFrame appabs">
        <div class="frameHead">
            <div class="leftHead">
                <div class="backPage" @click="backHome">兑卡</div>
            </div>
            <div class="rightHead">
                <div class="info"><span>{{userName}}</span><span>{{className}}</span><span @click="backHome">退出({{countDown}}s)</span></div>
            </div>
        </div>

        <div class="frameBody">
            <div class="userStatistics">
                <div class="userName">
                    {{userName}}
                </div>
                <div class="medalInfo">
                    总勋章数: {{medalNum}}
                </div>
                <div class="scoreInfo">
                    总分数: {{scoreNum}}
                </div>
            </div>
            <div class="medalInBox">
                <div class="medalPlayBox">
                    <div class="exchangeTit">请插入卡片兑换</div>
                    <div class="waitGif">
                        <img :src="exchageImgUrl">
                    </div>
                </div>
            </div>
        </div>

        <div class="mask" v-show="exChangeErrLayer||exChangeSuccessLayer"></div>
        <transition name="sliderRight">
            <div class="waitDialog" v-show="exChangeErrLayer">
                <div class="errorInfo"><span>无效卡</span></div>
                <div class="waitGif error">
                    <img :src="invalidCard">
                </div>
            </div>
        </transition>

        <transition name="sliderRight">
            <div class="resultDialog" v-show="exChangeSuccessLayer">
                <div class="exchangeTit">兑换成功</div>
                <div class="successInfo">{{exChangeResult.rewardType==1?'分数':'勋章'}}  <span>+{{exChangeResult.rewardNum}}</span></div>
                
                <div class="waitGif successGif">
                    <img :src="resultImgUrl">
                </div>
                <!-- 
                <div class="exchangeBtn">
                    <div class="againExchange" @click="againExchange">继续兑卡</div>
                </div> -->
            </div>
        </transition>



    </div>
</template>

<script>
import {setTokenTime,clearTime} from '@/utils/comm'
import _ from 'lodash'
import * as api from '@/api/api';
export default {
    data(){
        return{
          userName:"",
          className:"",
          countDown:0,  
          medalNum:0,
          scoreNum:0,
          exchageImgUrl:'./static/img/plugInCard.gif',
          invalidCard: './static/img/cardnoinfo.png',
          resultImgUrl:'./static/img/dot-xz.png',
          exChangeErrLayer:false,
          exChangeSuccessLayer:false,
          exChangeResult:{},
          countTime:null,
          isScore:false,
        }
    },
    created(){
        this.countDown = window.countDownTime
        console.log("11122223333")
        this.$store.dispatch("SetSwallowComplete",false);
    },
    mounted(){
        this.init();
    },
    destroyed(){
        this.backHome();
    },
    computed:{
        swallowComplete () {
            return this.$store.getters.swallowComplete;　　//
        },
    },
    watch:{
        swallowComplete:function(isComplete){
            if(isComplete){
                this.checkCard(window.localStorage.getItem("card_No"));
                console.log("读到卡咯卡号为：",window.localStorage.getItem("card_No"))
            }
        },
    },
    destroyed(){
        // 清除倒计时控制器
        clearTimeout(this.countTime);
    },
    methods:{
        async init(){
            let optres = await api.canUse();
            // 重置用户退出的默认时间
            // setTokenTime();
            
            this.countDownInterval();
            // 打开吞卡机
            this.$store.dispatch("SetSwallowState",1);
            this.userName = window.localStorage.getItem("card_username");
            this.className = window.localStorage.getItem("className");
            this.getUserMedal();
        },
        countDownInterval(){
            console.log("aaaaaaaaaaaa")
            this.countTime = setTimeout(()=>{
                this.countDown--;
                if(this.countDown>0){
                    this.countDownInterval();
                }else{
                    this.backHome();
                }
            },1000)
        },
       
        /**
         * 获取用户勋章和积分
         */
        async getUserMedal(){
            let res = await api.getUserScoreMedalInfo({userId:window.localStorage.getItem("card_oauserid")});
            console.log(res,"res用户勋章")
            this.medalNum = _.cloneDeep(res.value.availableMedalNum);
            this.scoreNum = _.cloneDeep(res.value.totalScore);
        },

        // /**
        //  * 获取用户勋章
        //  */
        // async getUserMedal(){
        //     let res = await api.getUserMedalInfo({userId:window.localStorage.getItem("card_oauserid")});
        //     console.log(res,"res用户勋章")
        //     this.medalNum = _.cloneDeep(res.value.copyMedalNum);
        // },

        /**
         * 处理卡片信息保存币值
         */
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
                // this.exChangeResult.rewardType = res.value.rewardType;
                this.exChangeResult = res.value;
                if(this.exChangeResult.rewardType==1){
                    this.resultImgUrl = './static/img/dot-fz.png'
                }else{
                    this.resultImgUrl = './static/img/dot-xz.png'
                }
                let intoRes = await api.intocard();
                this.successExchange();
            }else{
                let intoRes = await api.outcard();
                this.errorExchange();
            }
            // 无论充卡是否成功，重置定时器
            // setTokenTime();
            this.countDown = window.countDownTime

            // 关闭吞卡机
            let optres = await api.noUse();
            this.$store.dispatch("SetSwallowComplete",false);
            console.log(res,"兑换成功")
        },
        /**
         * 无效卡的提示层
         */
        errorExchange(){
            this.exChangeErrLayer = true;
            setTimeout(async ()  => {
                this.$store.dispatch("SetSwallowState",1);
                let optres = await api.canUse();
                this.exChangeErrLayer = false;
            }, 1500);
        },
        /**
         * 成功后的提示层
         */
        successExchange(){
            this.exChangeSuccessLayer = true;
            //充值成功，再次获取用户余额
            
            setTimeout(async ()  => {
                this.$store.dispatch("SetSwallowState",1);
                this.getUserMedal();
                let optres = await api.canUse();
                this.exChangeSuccessLayer = false;
            }, 1500);
        },
        /**
         * 清空缓存并返回首页
         */
        async backHome(){
            let intoRes = await api.outcard();
            let optres = await api.noUse();
            window.localStorage.removeItem("token");
            this.$store.dispatch("SetSwipeState",0);  
            this.$store.dispatch("SetSwallowState",0);
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
    .frameHead{
        width: 100%;
        height: .9rem;
        background: #754AEC;
        .leftHead{
            float: left;
        }
        .backPage{
            height: .9rem;
            background: url(../assets/img/arrow-left.png) no-repeat left center;
            background-size: auto 40%;
            padding-left: .5rem;
            margin-left: .4rem;
            font-size: .34rem;
            line-height: .9rem;
            font-weight: bold;
            color: #FFF;
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
        }
    }
    .frameBody{
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .userStatistics{
            width: 100%;
            padding: .35rem .6rem;
            .userName{
                font-size: .6rem;
                font-weight: bold;
                color: #262626;
                float: left;
                line-height: .7rem;
            }
            .medalInfo{
                float: left;
                min-width: 3.1rem;
                padding: 0 .4rem 0 .6rem;
                height: .7rem;
                background: #FFB600;
                border-radius: .35rem;
                margin-left: 1rem;
                position: relative;
                color: #FFF;
                font-size: .36rem;
                line-height: .7rem;
                text-align: center;
            }
            .medalInfo::after{
                content: '\20';
                width: .95rem;
                height: .93rem;
                background: url(../assets/img/dot-xz.png) no-repeat center;
                background-size: 100% 100%;
                position: absolute;
                top: -.11rem;
                left: -.3rem;
            }
            .scoreInfo{
                float: left;
                min-width: 3.1rem;
                padding: 0 .4rem 0 .6rem;
                height: .7rem;
                background: #864AFF;
                border-radius: .35rem;
                margin-left: 1rem;
                position: relative;
                color: #FFF;
                font-size: .36rem;
                line-height: .7rem;
                text-align: center;
            }
            .scoreInfo::after{
                content: '\20';
                width: .95rem;
                height: .93rem;
                background: url(../assets/img/dot-fz.png) no-repeat center;
                background-size: 100% 100%;
                position: absolute;
                top: -.11rem;
                left: -.3rem;
            }
        }
        .medalInBox{
            flex: 1;
            height: 200px;
            width: 100%;
            padding: 0 .6rem .4rem;
            .medalPlayBox{
                width: 100%;
                height: 100%;
                background: #FFF;
                border-radius: 40px;
                padding: .8rem 0;
                .exchangeTit{
                    width: 100%;
                    font-size: .48rem;
                    color: #262626;
                    font-weight: bold;
                    text-align: center;
                }
                .waitGif{
                    text-align: center;
                }
            }
        }
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
.resultDialog{
    width: 9rem;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top:-3.5rem;
    margin-left:-4.5rem;
    z-index: 999;
    overflow: hidden;
    text-align: center;
    .exchangeTit{
        font-size: .64rem;
        font-weight: bold;
        color: #FFF;
    }
    .successInfo{
        font-size: .48rem;
        font-weight: bold;
        color: #FFF;
        padding: .5rem;
    }
    .successGif{
        img{
            width: 4rem;
        }
    }
}
.errorInfo{
    width: 100%;
    margin-top: .7rem;
    text-align: center;
    span{
        background: url(../assets/img/doterror.png) no-repeat left center;
        background-size: auto 100%;
        font-size: .42rem;
        font-weight: bold;
        color: #262626;
        padding-left: .6rem;
    }
}
.error{
    padding: .7rem;
}
</style>