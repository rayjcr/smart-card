import fetch from '../utils/fetch';

const PATH_HEAD = '/evaluation';
let Hard_Ware = '';
let BaseUrl = '';
let SstUrl = '';
// if(process.env.NODE_ENV == "development"){
//     Hard_Ware = '/HardWare';
// }else{
    Hard_Ware = 'http://localhost:5555';
    // Hard_Ware = 'http://192.168.0.31:5555'
    BaseUrl = 'http://oa.91118.com:8765/api';
    // BaseUrl = 'http://192.168.3.20:8765/api';
    SstUrl = 'http://115.236.5.90:8081';
// }



/** 获取token **/
export function getToken(query) {
    return fetch({
        url: `${BaseUrl}/auth/jwt/xxtToken`,
        method: 'POST',
        params: query
    });
}

/** 获取基础数据 **/
export function getStudentDetail(query) {
    return fetch({
        url: `${BaseUrl}/base/baseApi/getStudentDetail`,
        method: 'get',
        params: query
    });
}

export function atmRecordSave(query) {
    return fetch({
        url: `${BaseUrl}${PATH_HEAD}/atmRecord/save`,
        method: 'POST',
        data: query
    });
}


/** 商品-类别列表 **/
export function getGoodsTypeList(query) {
    return fetch({
        url: `${BaseUrl}${PATH_HEAD}/goodsType/list`,
        method: 'get',
        params: query
    });
}


/** 商品-分页列表 **/
export function getGoodsListPage(query) {
    return fetch({
        url: `${BaseUrl}${PATH_HEAD}/goods/listPage`,
        method: 'post',
        data: query
    });
}

/** 获取商品订单列表 **/
export function getGoodsOrder(query) {
    return fetch({
        url: `${BaseUrl}${PATH_HEAD}/goodsOrder/listPage`,
        method: 'post',
        data: query
    });
}


/** 打开刷卡串口 **/
export function openSwipe() {
    return fetch({
        url: `${Hard_Ware}/openrc`,
        method: 'post',
    });
}

/** 打开身份识别串口 **/
export function openSwipe2() {
    return fetch({
        url: `${Hard_Ware}/userOpenPort`,
        method: 'post',
    });
}

/** 关闭串口——1 **/
export function closeSwipe() {
    return fetch({
        url: `${Hard_Ware}/closerc`,
        method: 'post',
    });
}

/** 关闭串口——2 **/
export function closeSwipe2() {
    return fetch({
        url: `${Hard_Ware}/userClosePort`,
        method: 'post',
    });
}




/** 打开吞卡机串口 **/
export function openSwallow() {
    return fetch({
        url: `${Hard_Ware}/opencardport`,
        method: 'post',
    });
}

/** 轮询刷卡接口 userGetCard **/  
export function pollingSwipe() {
    return fetch({
        url: `${Hard_Ware}/userGetCard`,
        method: 'post',
    });
}

/** 轮询吞卡接口 **/
export function pollingSwallow() {
    return fetch({
        url: `${Hard_Ware}/getcard`,
        method: 'post',
    });
}

/** 吞卡接口 **/
export function intocard() {
    return fetch({
        url: `${Hard_Ware}/intocard`,
        method: 'post',
    });
}

/** 吐卡接口 **/
export function outcard() {
    return fetch({
        url: `${Hard_Ware}/outcard`,
        method: 'post',
    });
}

/** 关闭吞卡 **/
export function noUse() {
    return fetch({
        url: `${Hard_Ware}/noUse`,
        method: 'post',
    });
}

/** 打开吞卡 **/
export function canUse() {
    return fetch({
        url: `${Hard_Ware}/canUse`,
        method: 'post',
    });
}

/** 打开吞卡 **/
export function getPid() {
    return fetch({
        url: `${Hard_Ware}/getPid`,
        method: 'get',
    });
}

/** 兑换勋章商品 **/
export function exchange(query) {
    return fetch({
        url: `${BaseUrl}${PATH_HEAD}/goodsOrder/exchange`,
        method: 'POST',
        data: query
    });
}

/** 获取用户勋章基础信息 **/
export function getUserMedalInfo(query) {
    return fetch({
        url: `${BaseUrl}${PATH_HEAD}/characterItem/getUserMedalInfo`,
        method: 'get',
        params: query
    });
}

/** 获取用户积分信息 **/
export function getUserScoreMedalInfo(query) {
    return fetch({
        url: `${BaseUrl}${PATH_HEAD}/reportCard/getStuEvaluationData/`+query.userId,
        method: 'get',
    });
}

/** 获取师生通学生基本信息 **/
export function getStudentInfo(params) {
    return fetch({
        url: `${Hard_Ware}/GetStudentInfoByCard?school=`+params.xxdm+`&card=`+params.cardNo,
        method: 'post',
    });
}

/** 获取抵消卡列表 **/
export function getRemindVOList(params) {
    return fetch({
        url: `${BaseUrl}${PATH_HEAD}/remindRecord/getEvaluationRemindVO`,
        method: 'get',
        params:params
    });
}

/** 抵消卡 **/
export function deductionByEvaluation(params) {
    return fetch({
        url: `${BaseUrl}${PATH_HEAD}/remindRecord/deductionByEvaluation`,
        method: 'get',
        params:params
    });
}

// http://115.236.5.90:8081/api/Student/GetStudentInfoByCard/1544/333399979
