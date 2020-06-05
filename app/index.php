<?php 
echo '<html>
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">
    <meta name="first" content="0" />
    <link href="style/common.css" rel="stylesheet" type="text/css">
    <title>open browser</title>
</head>
<body>
    <div class="app-container" id="container"></div>';
    function get($key, $default = null){
        if (isset($_GET[$key])) {
            return $_GET[$key];
        } else {
            return $default;
        }
    }
    $isFirst = get("isFirst");
    if($isFirst){
        echo '<div class="ob-pending-bg" id="ob_pending"><img src="image/common/small/background-dummy.gif" /></div>';
    }
    echo '<script src="lib/require.js" defer async="true" data-main="./index"></script>
</body>
</html>';