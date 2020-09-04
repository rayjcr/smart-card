<template>
    <div class="mainFrame appabs">
        <div class="frameHead">
            <div class="leftHead">
                <div class="backPage" @click="backMall">我的订单</div>
            </div>
            <div class="rightHead">
                <div class="info"><span>{{userName}}</span><span>{{className}}</span><span>退出({{countDown}}s)</span></div>
            </div>
        </div>
        <div class="frameBody">
            <div class="orderSum">共 <span>{{orderTotle}}</span> 个订单</div>
            <div class="orderTable">
                <table class="tableHead">
                    <tr>
                        <td width="30%">时间</td>
                        <td width="40%">商品</td>
                        <td width="10%">勋章</td>
                        <td width="20%">状态</td>
                    </tr>
                </table>
                <div class="tableMain"  ref="scrollOrder">
                    <div class="fl wfull" ref="orderList">
                        <table class="tableBody" cellspacing='0' cellpadding='0'>
                            <tr v-for="(item,index) in orderList" :key="index">
                                <td width="30%">{{item.createTime}}</td>
                                <td width="40%">{{item.goodsName}}</td>
                                <td width="10%">{{item.price}}</td>
                                <td width="20%" v-html="statusStr(item.status)"></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {setTokenTime,clearTime} from '@/utils/comm'
import * as api from '@/api/api';
export default {
    data(){
        return{
            orderList:[],
            orderTotle:0,
            orderLimit:2,
            orderCurPage:1,
            userName:"",
            className:"",
            countDown:0,
            timeoutObj:null,
        }
    },
    mounted(){
        this.init();
        this.$refs.scrollOrder.addEventListener('scroll',this.checkScroll)
    },
    destroyed(){
        clearTimeout(this.timeoutObj)
    },
    methods:{
        async init(){
            this.userName = window.localStorage.getItem("card_username");
            this.className = window.localStorage.getItem("className");
            // setTokenTime();
            this.countDown = window.countDownTime
            this.countDownInterval();

            this.getOrderList();
        },
        countDownInterval(){
            this.timeoutObj = setTimeout(()=>{
                this.countDown--;
                if(this.countDown>0){
                    this.countDownInterval();
                }else{
                    // this.backHome();
                }
            },1000)
        },
        async getOrderList(){
            let param = {}
            param.limit = this.orderLimit;
            param.page = this.orderCurPage;
            param.userCode = window.localStorage.getItem("card_oauserid");

            let res = await api.getGoodsOrder(param);
            this.orderTotle = res.value.totalCount;
            this.orderList.push.apply(this.orderList,res.value.dataList);
            this.checkScroll()
            // console.log(res,"res")
        },
        backMall(){
            this.$router.push({path:'mall'})
        },
        statusStr(num){
            switch (num){
                case 0:
                    return  "<span class='stat_1'>待领取</span>"
                case 1:
                    return  "<span class='stat_2'>已领取</span>"
                case -1:
                    return  "<span class='stat_3'>已退单</span>"
            }
        },
        checkScroll(){
            this.$nextTick(() => {
                let scrollTop = this.$refs.scrollOrder.scrollTop;
                let boxHeight = this.$refs.scrollOrder.clientHeight;
                let scrollHeight = this.$refs.scrollOrder.scrollHeight;
                // console.log(scrollTop+boxHeight+40,"A")
                // console.log(scrollHeight,"B")
                // console.log(scrollTop+boxHeight+40>scrollHeight)

                if(this.orderCurPage<Math.ceil(this.orderTotle/this.orderLimit)&&((scrollTop+boxHeight+40)>scrollHeight)){
                    this.orderCurPage++;
                    // console.log(this.orderCurPage,'this.orderCurPage')
                    this.getOrderList();
                }
            })
        },
    }
}
</script>

<style lang='scss' scoped>
.fl{
    float: left;
}
.wfull{
    width: 100%;
}
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
        .exitUser{
            font-size: .36rem;
            color: #FFF;
        }
    }
}
.frameBody{
    flex: 1;
    padding: .4rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .orderSum{
        font-size: .48rem;
        color: #262626;
        font-weight: bold;
        padding-bottom: .4rem;
        line-height: .48rem;
        span{
            color: #33A5FF;
        }
    }
    .orderTable{
        width: 100%;
        overflow: hidden;
        flex: 1;
        display: flex;
        flex-direction: column;
        .tableHead{
            width: 100%;
            height: 1rem;
            line-height: 1rem;
            background: #FFF;
            border-bottom: 1px solid #f2f2f2;
            font-size: .36rem;
            color: #262626;
            td{
                padding-left: .2rem;
                font-weight: bold;
                border-collapse: collapse;
            }
        }
        .tableMain{
            flex: 1;
            background: #FFF;
            overflow: auto;
            .tableBody{
                width: 100%;
                font-size: .26rem;
                color: #262626;
                tr:nth-child(even){
                    background: #E7E9EB;
                }
                td{
                    padding-left: .2rem;
                    height: .8rem;
                    line-height: .8rem;
                    border-collapse: collapse;
                    border: 0;
                }
            }
            
        }
    }
}
</style>
<style>
.stat_1{
    color: #33A5FFFF;
}
.stat_2{
    color: #666666;
}
.stat_3{
    color: #ff4200;
}
</style>