<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
include("headers.php");
include("config/db.php");

$id = isset($_GET['id']) ? $_GET['id'] : 0;

$stmt = $conn->prepare("
    SELECT e.*, c.category_name 
    FROM events e
    LEFT JOIN categories c ON c.id = e.category_id
    WHERE e.id = ? AND (e.status) = 'approved' ");
$stmt->bind_param("i", $id);
$stmt->execute();

$result = $stmt->get_result();
$event = $result->fetch_assoc();

echo json_encode([
    "event" => $event
]);
