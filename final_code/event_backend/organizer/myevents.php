<?php
session_start();
include("../headers.php");
include("../config/db.php");

// User must be logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

// Only organizers allowed
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'organizer') {
    echo json_encode([
        "status" => false,
        "message" => "Access denied: Only organizers can access this resource"
    ]);
    exit;
}

$organizer_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT 
  e.*, 
  c.category_name 
FROM events e
JOIN categories c ON e.category_id = c.id WHERE organizer_id=?");
$stmt->bind_param("i", $organizer_id);
$stmt->execute();

$result = $stmt->get_result();
$events = [];

while ($row = $result->fetch_assoc()) {
    $events[] = $row;
}

echo json_encode(["status" => true, "events" => $events]);
