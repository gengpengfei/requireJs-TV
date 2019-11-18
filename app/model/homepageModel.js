define(['js/network'],function(network, factory) {
    'use strict';
    var homepageModel = {};
    homepageModel.getRecommendedData = function(){
        console.log('api: 获取九宫格数据 ----------->');
        var params = {duid:'111',token:'111'}
        var option = {
            url:'index.php',
            type:'GET',
            dataType:'json',
            data:params
        }
        return network.send(option).then(function(request){
            var req = JSON.parse(request);
            req = [
                {'url':'https://baidu.com','img':'1.png'},
                {'url':'https://baidu.com','img':'2.png'},
                {'url':'https://baidu.com','img':'3.png'},
                {'url':'https://baidu.com','img':'4.png'},
                {'url':'https://baidu.com','img':'5.png'},
                {'url':'https://baidu.com','img':'6.png'},
                {'url':'https://baidu.com','img':'7.png'},
                {'url':'https://baidu.com','img':'8.png'},
                {'url':'https://baidu.com','img':'1.png'},
                {'url':'https://baidu.com','img':'2.png'},
                {'url':'https://baidu.com','img':'3.png'},
                {'url':'https://baidu.com','img':'4.png'},
            ]
            return req
        }).catch(function(){
            return [
                {'url':'https://baidu.com','img':'1.png'},
                {'url':'https://baidu.com','img':'2.png'},
                {'url':'https://baidu.com','img':'3.png'},
                {'url':'https://baidu.com','img':'4.png'},
                {'url':'https://baidu.com','img':'5.png'},
                {'url':'https://baidu.com','img':'6.png'},
                {'url':'https://baidu.com','img':'7.png'},
                {'url':'https://baidu.com','img':'8.png'},
                {'url':'https://baidu.com','img':'1.png'},
                {'url':'https://baidu.com','img':'2.png'},
                {'url':'https://baidu.com','img':'3.png'},
                {'url':'https://baidu.com','img':'4.png'},
            ]
        });
    }
    return homepageModel
});