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

$stmt = $conn->prepare("DELETE FROM contact_messages WHERE id=?");
$stmt->bind_param("i", $id);

if($stmt->execute()){
    echo json_encode(["status"=>true,"message"=>"Message deleted"]);
}else{
    echo json_encode(["status"=>false,"message"=>"Delete failed"]);
}

$stmt->close();
?>
