<?php
session_start();
include("../headers.php");
include("../config/db.php");

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => false, "message" => "Unauthorized"]);
    exit();
}

$sql = "
SELECT 
  e.*, 
  u.name AS organizer_name,
  c.category_name
FROM events e
JOIN users u ON e.organizer_id = u.id
JOIN categories c ON e.category_id = c.id
ORDER BY e.created_at ASC
";

$res = mysqli_query($conn, $sql);
$events = [];

while ($row = mysqli_fetch_assoc($res)) {
    $events[] = $row;
}

echo json_encode(["status" => true, "events" => $events]);
