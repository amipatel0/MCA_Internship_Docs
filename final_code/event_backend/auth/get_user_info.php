<?php
session_start();
include("../headers.php");
include("../config/db.php");


if (isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "name" => $_SESSION['name'],
            "role" => $_SESSION['role'],
            "phone" => $_SESSION['phone'] ?? ''
        ]
    ]);
} else {
    echo json_encode(["status" => false, "message" => "Not logged in"]);
}
?>
