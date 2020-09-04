<template>
    <div id="app">
        <transition name="sliderRight">
            <router-view/>
        </transition>
    </div>
</template>

<script>
import * as api from '@/api/api';
import {setTokenTime} from '@/utils/comm'
export default {
    name: 'App',
    data(){
        return{
            timeSwipe:Object,
            timeSwallow:Object, 
        }
    },
    watch: {
        $route(to,from) {
            // console.log(to,from,"to,from")
        }
    },
    mounted(){
        setTokenTime();
        try{
            let ipc = window.require('electron').ipcRenderer;
            ipc.send('openServer');
        }catch(e){
            console.log("非桌面应用启动")
        }
        this.getServer();
    },
    methods:{
        /** 
         * 判断server是否已经启动 
         */
        async getServer(){
            try{
                console.log("111222")
                if(await api.getPid()){
                    let isInit = await this.openPort() ;
                    // 内容穿透工具初始化
                }else{
                    setTimeout(this.getServer(),1000)
                }
            }catch(e){
                this.getServer()
            }
            
        },
        /**
         * 初始化打开所有串口
         */
        async openPort(){
            

            // 吞卡口识别串口
            this.$LayerTips({content:'系统初始化请稍后',time:2000});

            const resClosePort = await Promise.all([api.closeSwipe(),api.closeSwipe2()]);
            // 初始化3个串口 无论成功与否继续调用轮询（轮询通过代表串口已经开启）
            const resOpnePort = await Promise.all([api.openSwipe(),api.openSwipe2(),api.openSwallow()]);

            
            // 调用轮询接口
            const [result1, result2] = await Promise.all([api.pollingSwallow(), api.pollingSwipe()]);

            console.log(result1,result2,"Promise.all的返回")
            if(result1.resultCode==-3 || result2.resultCode==-3){
                this.$LayerTips({content:'设备初始化失败<br>请联系管理员<br>',time:2000});
                setTimeout(this.openPort(),2000)
                return false
            }

            // let res = await api.openSwipe();
            // if(res.resultCode!=1){
            //     // this.$LayerTips({content:'串口启动失败，检查机器设备',time:4000});
            //     this.$LayerTips({content:'设备初始化失败<br>请联系管理员',time:0});
            //     return false
            // }

            // // 身份卡识别串口
            // // res = await api.openSwipe2();
            // // if(res.resultCode!=1){
            // //     // this.$LayerTips({content:'串口启动失败，检查机器设备',time:4000});
            // //     this.$LayerTips({content:'设备初始化失败<br>请联系管理员',time:0});
            // //     return false
            // // }

            // // 吞卡机器串口
            // res = await api.openSwallow();
            // if(res.resultCode!=1){
            //     // this.$LayerTips({content:'串口启动失败，检查机器设备',time:4000});
            //     this.$LayerTips({content:'设备初始化失败<br>请联系管理员',time:0});
            //     return false
            // }
            
            this.initPolling()  
            console.log("3个串口都已启动")
            return true
        },
        /**
         * 轮询 2个读卡口 (身份口,吞卡及读卡口)
         */
        async initPolling(){
            // 初始化关闭吞卡口
            let optres = await api.noUse();
            clearInterval(this.timeSwipe);
            this.timeSwipe = setInterval(async () => {
                await this.isSwipeCard()
            }, 1000);

            clearInterval(this.timeSwallow);
            this.timeSwallow = setInterval(async () => {
                await this.isSwallowCard()
            }, 1000);
        },

        /**
         * 身份卡串口调用方法 （轮询） 
         * 相关操作会开启身份卡识别串口然后把状态调整为 1 等待刷卡 
         * this.$store.dispatch("SetSwipeState",1);
         * 然后调用pollingSwipe方法,返回读卡机读取到的卡号 res.value
         */
        async isSwipeCard(){
            // 如浏览器缓存没有 token 就返回到主页。
            if(!window.localStorage.getItem('token')){
                if(this.$router.currentRoute.path.indexOf("index")==-1){
                    this.$router.push({path:'/'});
                };
            }
            // swipeState （状态为1 是等待刷卡状态） 
            if(this.$store.getters.swipeState!=0){
                console.log(this.$store.getters.swipeState,"this.$store.getters.swipeState")
                let res = await api.pollingSwipe();
                console.log(res,"获取了身份卡卡号");
                // 测试
                // let res = {}
                // res.resultCode = 1
                // res.value = '123456'
                if(res.resultCode==1){
                    // 已经获取卡号 等待状态取消
                    this.$store.dispatch("SetSwipeState",0);
                    if(this.$store.getters.confirmExchange){
                        // 商城页面用户确认
                        this.checkUser(res.value)
                    }else{
                        // 首页获取用户信息
                        this.getStudentInfo(res.value)
                    }
                }
                return false
            }
            return false
        },
        /**
         * 获取用户信息
         */
        async getStudentInfo(cardNo){
            let params = {}
            // let TimeStr = '10s';
            params.cardNo = cardNo;
            try{
                let res = await api.getStudentInfo(params);
                // 测试用户 何媛媛 
                // res.userCode = "4171215144345740"
                if(res.resultCode!=1){
                    console.log("6666699999");
                    this.$store.dispatch("SetErrorState",true);
                    return;
                }
                console.log(res.value,"res.value")
                let resObj = JSON.parse(res.value);
                
                // 记录用户id 和 头像到浏览器缓存
                window.localStorage.setItem('card_No',cardNo)
                window.localStorage.setItem("card_userid",resObj.userCode)
                window.localStorage.setItem("card_oauserid",("3"+resObj.userCode.substr(1,resObj.userCode.length)))
                window.localStorage.setItem("card_useravatar",resObj.avatar)
                window.localStorage.setItem('xxdm',resObj.schoolCode)

                // this.$cookie.set("card_userid",res.userCode);
                // this.$cookie.set("card_oauserid",res.userCode.replace("4","3"));
                // this.$cookie.set("card_useravatar",res.avatar);  
                // this.$cookie.set("card_oauserid",res.userCode.replace("4","3"),{expires:'6000s'});
                // schoolCode=1544&studentId=3171215144345740

                // 通过用户ID获取 用户token
                let tokenRes = await api.getToken({xxdm:window.localStorage.getItem('xxdm'),usercode:("4"+resObj.userCode.substr(1,resObj.userCode.length)),platform:0});
                if(tokenRes.status==200){
                    // this.$cookie.set("token",tokenRes.data,{expires:TimeStr})
                    window.localStorage.setItem('token',tokenRes.data)
                    // 启动token倒计时 10秒后清空token
                    // setTokenTime();
                }else{
                    // 错误状态显示
                    this.$store.dispatch("SetErrorState",true);
                }

                // 获取用户详细信息
                let stuRes = await api.getStudentDetail({schoolCode:window.localStorage.getItem('xxdm'),studentId:window.localStorage.getItem("card_oauserid")});
                console.log(stuRes,"stuRes")
                if(stuRes.resultCode==1){
                    // 保存用户各种信息（班级id，班级名称，年级id，持卡人姓名）
                    window.localStorage.setItem("classId",stuRes.value.classId)
                    window.localStorage.setItem("className",stuRes.value.className)
                    window.localStorage.setItem("gradeId",stuRes.value.gradeId)
                    window.localStorage.setItem("card_username",stuRes.value.name)
                    // this.$cookie.set("classId",stuRes.value.classId);
                    // this.$cookie.set("className",stuRes.value.className);
                    // this.$cookie.set("gradeId",stuRes.value.gradeId);
                    // this.$cookie.set("card_username",stuRes.value.name)
                }else{
                    // 错误状态显示
                    this.$store.dispatch("SetErrorState",true);
                }
                // 2190604155141213 ,4171215144345740
                // 读卡完毕状态
                this.$store.dispatch("SetSwipeComplete",true); 
            }catch(e){
                this.$store.dispatch("SetErrorState",true);
            }
        },
        checkUser(cardNo){
            // cardNo = "4171215144345740"
            if(cardNo == window.localStorage.getItem("card_No")){
                console.log("用户是同一个,确认通过")
                this.$store.dispatch("SetCheckComplete",true);
            }else{
                console.log("不是同一个用户")
                this.$store.dispatch("SetErrorState",true);
            }
        },
        /***
         * 轮询吞卡机 swallowState=1 打开轮询 =0直接跳出
         */
        async isSwallowCard(){
            if(this.$store.getters.swallowState!=0){
                let res = await api.pollingSwallow();
                // console.log("这里轮询吞卡口")
                if(res.resultCode==1){
                    // console.log(res,"res")
                    // 停止吞吐卡机
                    this.$store.dispatch("SetSwallowState",0);
                    // 读到卡号的标识置为true
                    this.$store.dispatch("SetSwallowComplete",true);
                    // 当前卡号写入缓存
                    window.localStorage.setItem("card_No",res.value);
                    // 已经获取卡号 等待状态取消
                    // this.$store.dispatch("SetSwallowState",0);
                    console.log("已经读到了卡片")
                    // this.getStudentInfo(res.value)
                    // return res.value
                }
                return false
            }
            return false
        },

        async getTokenTest(){
            let usercode_t = "40190423170521425" 
            window.localStorage.setItem("card_userid",usercode_t)
            window.localStorage.setItem("card_oauserid",usercode_t.replace("4","3"))
            let tokenRes = await api.getToken({xxdm:'1544',usercode:usercode_t,platform:0});
            if(tokenRes.status==200){
                window.localStorage.setItem('token',tokenRes.data)
                // setTokenTime();
                return true
            }else{
                return false
            }
        },
    }
}
</script>

<style>
@import './assets/css/base.scss';
.tipsBox a{
    text-decoration: none;
    color: #F90;
}
</style>
