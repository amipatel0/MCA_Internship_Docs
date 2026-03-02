<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
include "../headers.php";
include "../config/db.php";
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => false, "message" => "Only admins can view this"]);
    exit;
}

include "../config/db.php";

$sql = "SELECT * FROM event_registrations";
$result = $conn->query($sql);

$registrations = [];
while ($row = $result->fetch_assoc()) {
    $registrations[] = $row;
}

echo json_encode([
    "status" => true,
    "registrations" => $registrations
]);
?>
