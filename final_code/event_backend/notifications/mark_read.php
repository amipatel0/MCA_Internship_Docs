<?php
session_start();
include "../config/db.php";
include("../headers.php");
require("../includes/notifications.php");

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
    UPDATE notifications
    SET is_read = 1
    WHERE user_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();

echo json_encode(["status"=>true]);
?>