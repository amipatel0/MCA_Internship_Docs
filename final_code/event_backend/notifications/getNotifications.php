<?php
session_start();
include "../config/db.php";
include("../headers.php");
require("../includes/notifications.php");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status"=>false]);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$notifications = [];
$unread_count = 0;

while($row = $result->fetch_assoc()) {
    if ($row['is_read'] == 0) $unread_count++;
    $notifications[] = $row;
}

echo json_encode([
    "status" => true,
    "notifications" => $notifications,
    "unread_count" => $unread_count
]);
?>