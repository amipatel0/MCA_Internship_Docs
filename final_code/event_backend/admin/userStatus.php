<?php
include("../headers.php");
include("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data['id']);
$status = $data['status']; // active or blocked

if (!in_array($status, ['active', 'blocked'])) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid status"
    ]);
    exit;
}

$query = "UPDATE users SET status='$status' WHERE id=$id";
$result = mysqli_query($conn, $query);

if ($result) {
    echo json_encode([
        "status" => true,
        "message" => "User status updated successfully"
    ]);
} else {
    echo json_encode([
        "status" => false,
        "message" => "Failed to update status"
    ]);
}
?>
