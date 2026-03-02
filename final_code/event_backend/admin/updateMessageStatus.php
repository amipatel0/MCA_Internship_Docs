<?php
session_start();
include "../headers.php";
include "../config/db.php";

header("Content-Type: application/json");

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status"=>false,"message"=>"Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data['id']);
$status = $data['status']; 

$stmt = $conn->prepare("UPDATE contact_messages SET status=? WHERE id=?");
$stmt->bind_param("si", $status, $id);

if($stmt->execute()){
    echo json_encode(["status"=>true,"message"=>"Status updated"]);
}else{
    echo json_encode(["status"=>false,"message"=>"Update failed"]);
}

$stmt->close();
?>
