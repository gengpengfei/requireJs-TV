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
    <div class="app-container" id="container">
        <div class="searchpage-container module-none" module="searchpage" id="searchpage_container">
        <div class="searchpage">
            <div class="s-head"></div>
            <div class="s-search row-top" id="s_search">
                <div class="s-search-tab row-between">
                    <div class="s-search-button row-start" id="s_search_1_1" name="s_focus">
                        <input type="text" class="pointer-events" maxlength="2048" id="s_search_input">
                        <div class="divider-2 pointer-events"></div>
                        <div class="s-search-icon pointer-events"></div>
                    </div>
                    <!-- <div class="s-search-barcode row-center"  id="s_search_2_1" name="s_focus"></div> -->
                </div>
            </div>
            <div class="s-history row-center">
                <div class="s-history-list" id="s_history">
                    <div name="s_focus" id="s_history_1_1"><span></span></div>
                    <div name="s_focus" id="s_history_2_1"><span></span></div>
                    <div name="s_focus" id="s_history_3_1"><span></span></div>
                    <div name="s_focus" id="s_history_1_2"><span></span></div>
                    <div name="s_focus" id="s_history_2_2"><span></span></div>
                    <div name="s_focus" id="s_history_3_2"><span></span></div>
                </div>
            </div>
            <div class="s-keyboard"></div>
        </div>
    </div>
    <script src="lib/require.js" defer async="true" data-main="./search"></script>
</body>
</html>';