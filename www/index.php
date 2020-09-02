<?php
    function get($key, $default = null){
        if (isset($_GET[$key])) {
            return $_GET[$key];
        } else {
            return $default;
        }
    }
    $head = null;
    $params = array();
    if(!empty($_SERVER['HTTP_HEAD'])){
        $head = $_SERVER['HTTP_HEAD'];
    }else if(get("head")){
        $head = get("head");
    }
    // $head = 'DmWZ/cUl+O8uXtmmA+wD7vbqOnyxWaezkbkqhIkiZX9X+iS4adkZvRLwJLuyAK7SNbBEzeZf9o1CnEYtRAagwmNquDe3twJcRIIknzL2XlzCV+ewq5AhDxsFaFdduwMBjwoFdG+KEajEGGSGkThIGg==';
    $AES_KEY = "Seraphic-crop!@#$%^&*()123456789";
    $AES_IV = "1234567890123456";
    $result = base64_decode($head);
    $result = openssl_decrypt($result, 'AES-256-CBC', $AES_KEY, OPENSSL_RAW_DATA, $AES_IV);
    if($result){
        $res_arr = explode("&",$result);
        foreach ($res_arr as $value) {
            $key_v = explode("=",$value);
            $params[$key_v[0]] = $key_v[1];
        }
    }else{
        $params = array(
            "av"=>"0.0.0.0.0",
            "pn"=>"default",
            "pt"=>"default",
            "bt"=>"32",
            "du"=>null,
            "ls"=>0
        );
    }
?>
<html>
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">
    <meta name="first" content="0" />
    <link href="app/style/common.css" rel="stylesheet" type="text/css">
    <title>open browser</title>
</head>
<body>
    <div class="app-container" id="container"></div>
    <script type="text/javascript">
        <?php
            echo 'var appVersion = "' .$params['av']. '";';
            echo 'var projectName = "' .$params['pn']. '";';
            echo 'var projectTag = "' .$params['pt']. '";';
            echo 'var bootType = "' .$params['bt']. '";';
            echo 'var duid = "' .$params['du']. '";';
            echo 'var limitSelect = "' .$params['ls']. '";';
        ?>
        var appType = bootType.split("")[0];
        var bookmarkType = bootType.split("")[1];
    </script>
    <script src="app/lib/require.js" defer async="true" data-main="app/index"></script>
    <script type="text/javascript">
    console.log(appVersion,projectName,projectTag,bootType,duid,limitSelect);
        if((appType == 1 || appType == 2) && !window.jsUtil){
            var body_width = document.body.scrollWidth;
            var image = 'small';
            if(body_width > 1920){
                image = 'big';
            }

            var bg_dom = document.createElement('div');
            bg_dom.setAttribute('id','ob_pending');
            bg_dom.setAttribute('class','ob-pending-bg');
            bg_dom.innerHTML = '<img src="app/image/common/'+image+'/background-dummy.gif" />'
            document.getElementsByTagName('body')[0].append(bg_dom);
            window.onload = function(){
                w_onload = true;
            }

            var timeOut = false;
            var _timeOut = setTimeout(function(){
                timeOut = true;
            }, 3000);

            var _interval = setInterval(function(){
                if(timeOut == true && w_onload == true){
                    var pending_dom = document.getElementById("ob_pending");if(pending_dom) pending_dom.parentNode.removeChild(pending_dom);
                    clearInterval(_interval);
                    clearTimeout(_timeOut);
                }
            }, 1000);
        }
    </script>
</body>
</html>