<?php

define("FUNCTIONS", "IMPORTED");

// Server Configuration
$deployment = json_decode(file_get_contents(dirname(__FILE__).'/deployment.json'), true);
$branch_config_path = $deployment['secrets-root'] . '/config-' . $deployment['branch'] . '.json';
$general_config_path = $deployment['secrets-root'] . '/config.json';
$config_path = is_file($branch_config_path) ? $branch_config_path : $general_config_path;
$_CONFIG = json_decode(file_get_contents($config_path), true);

// Errors
error_reporting(E_ALL);
if ($deployment=="local") {
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
} else {
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
}

// URL / Redirection
$use_ssl = $_CONFIG["use_ssl"];
$basehost = $_CONFIG["base_host"];
$basepath = $_CONFIG["base_path"];
$baseurl = ($use_ssl?"https":"http")."://".$basehost.$basepath;

if ($use_ssl && (!isset($_SERVER["HTTPS"]) || $_SERVER["HTTPS"]!="on" || $_SERVER["HTTP_HOST"]!=$basehost)) {
    echo preg_match("/^([a-zA-Z0-9]+).xn--bffl-ooa4l.ch$/", $_SERVER["HTTP_HOST"], $matches); // TODO: remove
    header("HTTP/1.1 302 Found");
    header("Location: ".$baseurl."?redirected=true");
    exit();
}

// Path
$cwd = substr(getcwd(), strlen(dirname(__FILE__)));
if ($cwd[0]=='/') $cwd = substr($cwd, 1);
chdir(dirname(__FILE__));

// Session
if ($deployment=='remote') session_set_cookie_params(1800, $basepath);
session_start();

$_HEADERS = getallheaders();

// DB
$db = new mysqli($_CONFIG["mysql_host"], $_CONFIG["mysql_username"], $_CONFIG["mysql_password"], $_CONFIG["mysql_scheme"]);
$db->set_charset("utf8");
function DBEsc($str) {
    global $db;
    return $db->escape_string($str);
}


// API
function succ($val, $embed=0) {
    header("HTTP/1.1 200 OK");
    header("Content-Type: application/json");
    if ($embed==1) {
        $md5 = md5(json_encode($val));
        $param = json_decode(file_get_contents("php://input"), true);
        if (isset($param["md5"]) && $param["md5"]==$md5) {
            echo json_encode(array("md5"=>$md5));
        } else {
            echo json_encode(array("md5"=>$md5, "payload"=>$val));
        }
    } else {
        echo json_encode($val);
    }
    exit();
}
function fail($status, $mmsg, $msg=false, $val=false) {
    $httpstatuscodes = array(
        100=>"Continue",
        101=>"Switching Protocols",
        102=>"Processing",

        200=>"OK",
        201=>"Created",
        202=>"Accepted",
        203=>"Non-Authoritative Information",
        204=>"No Content",
        205=>"Reset Content",
        206=>"Partial Content",
        207=>"Multi-Status",
        208=>"Already Reported",
        226=>"IM Used",

        300=>"Multiple Choices",
        301=>"Moved Permanently",
        302=>"Found",
        303=>"See Other",
        304=>"Not Modified",
        305=>"Use Proxy",
        306=>"Reserved",
        307=>"Temporary Redirect",
        308=>"Permanent Redirect",

        400=>"Bad Request",
        401=>"Unauthorized",
        402=>"Payment Required",
        403=>"Forbidden",
        404=>"Not Found",
        405=>"Method Not Allowed",
        406=>"Not Acceptable",
        407=>"Proxy Authentication Required",
        408=>"Request Timeout",
        409=>"Conflict",
        410=>"Gone",
        411=>"Length Required",
        412=>"Precondition Failed",
        413=>"Request Entity Too Large",
        414=>"Request-URI Too Long",
        415=>"Unsupported Media Type",
        416=>"Requested Range Not Satisfiable",
        417=>"Expectation Failed",
        422=>"Unprocessable Entity",
        423=>"Locked",
        424=>"Failed Dependency",
        426=>"Upgrade Required",
        428=>"Precondition Required",
        429=>"Too Many Requests",
        431=>"Request Header Fields Too Large",

        500=>"Internal Server Error",
        501=>"Not Implemented",
        502=>"Bad Gateway",
        503=>"Service Unavailable",
        504=>"Gateway Timeout",
        505=>"HTTP Version Not Supported",
        506=>"Variant Also Negotiates (Experimental)",
        507=>"Insufficient Storage",
        508=>"Loop Detected",
        510=>"Not Extended",
        511=>"Network Authentication Required"
    );
    header("HTTP/1.1 ".$status." ".$httpstatuscodes[$status]."");
    header("Content-Type: application/json");
    $arr = array("mmsg"=>$mmsg, "msg"=>$msg, "data"=>$val);
    echo json_encode($arr);
    exit();
}

// Website
function echo_header() {
    global $baseurl, $_CONFIG, $_APPS, $branchpath, $version;
    $menu = array(
        array("home.php", "Home"),
        array("advantages.php", "Vorteile"),
        array("support.php", "Support"),
    );
    echo '<!DOCTYPE html>
<html style="height:100%;">
<head>
<title>OpenO</title>
<meta http-equiv="content-type" content="text/html;charset=utf-8" />
<meta name="viewport" content="user-scalable=no, initial-scale=1.0, width=device-width" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<link rel="icon" type="image/x-icon" href="favicon.ico" />
<link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body style="height:100%;" class="bg">';
}
function echo_footer() {
    echo '</body>
</html>';
}

// cURL
function load_url($method, $url, $headers=false, $postfields=false, $auth=false) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_DNS_USE_GLOBAL_CACHE, 0);
    curl_setopt($ch, CURLOPT_DNS_CACHE_TIMEOUT, 1);
    curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($headers) curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($postfields) curl_setopt($ch, CURLOPT_POSTFIELDS, $postfields);
    if ($auth) curl_setopt($ch, CURLOPT_USERPWD, $auth);
    $file = curl_exec($ch);
    curl_close($ch);
    return $file;
}

?>
