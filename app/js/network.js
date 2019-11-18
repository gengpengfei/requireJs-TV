define(function() {
    'use strict';
    console.log('加载公共方法模块----------->');
    var fun = {};
    fun.send = function(option){
        return new Promise(function (resolve, reject) {
            var xmlhttp = null;
            xmlhttp = new XMLHttpRequest();
            /*判断是否支持请求*/
            if(xmlhttp == null) {
                alert('你的浏览器不支持XMLHttp');
                return;
            }
            /*请求方式，并且转换为大写*/
            var httpType = (option.type || 'GET').toUpperCase();
            /*数据类型*/
            var dataType = option.dataType || 'json';
            /*请求接口*/
            var httpUrl = option.url || '';
            /*是否异步请求*/
            var async = option.async || true;
            /*请求参数--post请求参数格式为：foo=bar&lorem=ipsum*/
            var paramData = option.data || [];
            var requestData = '';
            for(var name in paramData) {
                requestData += name + '='+ paramData[name] + '&';
            }
            requestData = requestData == '' ? '' : requestData.substring(0,requestData.length - 1);
            /*请求接收*/
            xmlhttp.onreadystatechange = function() {
                if(xmlhttp.readyState == 4) {
                    if(xmlhttp.status == 200){
                        resolve(xmlhttp.responseText);
                    }else{
                        reject(xmlhttp.statusText);
                    }
                }
            }
            xmlhttp.onerror = function () {
                reject(new Error(xmlhttp.statusText));
            };			
            /*接口连接，先判断连接类型是post还是get*/
            if(httpType == 'GET') {
                xmlhttp.open("GET",httpUrl,async);
                xmlhttp.send(null);
            }else if(httpType == 'POST'){
                xmlhttp.open("POST",httpUrl,async);
                //发送合适的请求头信息
                xmlhttp.setRequestHeader("Content-type", "application/json"); 
                xmlhttp.send(requestData);
            }
        })
    }
    return fun
});