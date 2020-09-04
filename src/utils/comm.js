import routers from '../router'

export function setTokenTime(){
    // console.log(routers,"routers")
    // console.log(timerToken,'set里的timerToken')
    // clearTimeout(timerToken);
    window.countDownTime = 30;
    // console.log("定时开启")
    // timerToken = setTimeout(function(){
    //     // console.log("定时结束关闭")
    //     window.localStorage.removeItem("token");
    //     clearTimeout(timerToken);
    //     // routers.push({'path':'/'});
    //     // window.location.href='/';
    // },300000);
}

export function clearTime(){
    // console.log(timerToken,'clear里的timerToken');
    // console.log("这里清空了定时器");
    window.localStorage.removeItem("token");
    // clearTimeout(timerToken);
    timerToken = null
    return;
}
