<?php
include "../headers.php";
include "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'];
$newPassword = password_hash($data['password'], PASSWORD_BCRYPT);

// check user exists
$check = mysqli_query($conn, "SELECT id FROM users WHERE email='$email'");

if (mysqli_num_rows($check) == 0) {
    echo json_encode([
        "status" => false,
        "message" => "Email not registered"
    ]);
    exit;
}

// update password
$update = mysqli_query(
    $conn,
    "UPDATE users SET password='$newPassword' WHERE email='$email'"
);

if ($update) {
    echo json_encode([
        "status" => true,
        "message" => "Password updated successfully"
    ]);
} else {
    echo json_encode([
        "status" => false,
        "message" => "Password update failed"
    ]);
}
?>
