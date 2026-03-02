<?php
include("../headers.php");
include("../config/db.php");

$result = $conn->query("SELECT id, name, email, role, created_at FROM users");

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode([
    "status" => true,
    "users" => $users
]);
