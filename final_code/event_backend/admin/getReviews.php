<?php
session_start();
include "../headers.php";
include "../config/db.php";

// Only admin can access
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin'])) {
    echo json_encode([
        "status" => false,
        "message" => "Unauthorized access"
    ]);
    exit;
}

// Fetch all reviews from DB
$sql = "SELECT r.id, r.event_id, r.rating, r.review, r.created_at, u.name as user_name, e.title as event_title
        FROM event_reviews r
        JOIN users u ON r.user_id = u.id
        JOIN events e ON r.event_id = e.id
        ORDER BY r.created_at DESC";

$result = $conn->query($sql);
$reviews = [];

while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

echo json_encode([
    "status" => true,
    "reviews" => $reviews
]);
