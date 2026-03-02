<?php
session_start();
include "../headers.php";
include "../config/db.php";

header("Content-Type: application/json");

//Allow only admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status"=>false,"message"=>"Unauthorized"]);
    exit;
}

$sql = "SELECT * FROM contact_messages ORDER BY created_at ASC";
$result = $conn->query($sql);

$messages = [];

while($row = $result->fetch_assoc()){
    $messages[] = $row;
}

echo json_encode(["status"=>true,"data"=>$messages]);
?>
