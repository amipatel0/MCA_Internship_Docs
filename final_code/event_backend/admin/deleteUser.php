<?php
header('Content-Type: application/json');
include("../headers.php");
include("../config/db.php");

// Get raw POST data
$data = json_decode(file_get_contents("php://input"), true);

// Debug log (optional, remove in production)
file_put_contents("debug_delete.txt", print_r($data, true));

if (!isset($data['id'])) {
    echo json_encode(["status" => false, "message" => "User ID missing"]);
    exit;
}

$id = intval($data['id']); // ensure numeric

try {
    // 1️⃣ Delete related event registrations first
    $stmt1 = $conn->prepare("DELETE FROM event_registrations WHERE user_id = ?");
    if (!$stmt1) throw new Exception("Prepare failed (event_registrations): " . $conn->error);

    $stmt1->bind_param("i", $id);
    $stmt1->execute();
    $stmt1->close();

    // 2️⃣ Delete the user
    $stmt2 = $conn->prepare("DELETE FROM users WHERE id = ?");
    if (!$stmt2) throw new Exception("Prepare failed (users): " . $conn->error);

    $stmt2->bind_param("i", $id);
    $stmt2->execute();

    if ($stmt2->affected_rows > 0) {
        echo json_encode(["status" => true, "message" => "User deleted successfully"]);
    } else {
        echo json_encode(["status" => false, "message" => "User not found"]);
    }

    $stmt2->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "Delete failed: " . $e->getMessage()]);
}
