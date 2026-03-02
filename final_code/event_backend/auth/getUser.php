<?php
session_start();
include("../headers.php");
header("Content-Type: application/json");

if(isset($_SESSION['user'])){
    echo json_encode([
        "status" => true,
        "user" => $_SESSION['user']
    ]);
}else{
    echo json_encode([
        "status" => false,
        "message" => "No user logged in"
    ]);
}
?>
