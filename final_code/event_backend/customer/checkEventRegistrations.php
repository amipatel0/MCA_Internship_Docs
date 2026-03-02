<?php
session_start();
include "../headers.php";
include "../config/db.php";

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "registered" => false
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];
$event_id = $_GET['event_id'] ?? null;

if (!$event_id) {
    echo json_encode(["registered" => false]);
    exit;
}

$stmt = $conn->prepare("
    SELECT status
    FROM event_registrations
    WHERE user_id = ? AND event_id = ?
");
$stmt->bind_param("ii", $user_id, $event_id);
$stmt->execute();

$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "registered" => true,
        "status" => $row['status'] // pending / confirmed / rejected
    ]);
} else {
    echo json_encode([
        "registered" => false
    ]);
}
