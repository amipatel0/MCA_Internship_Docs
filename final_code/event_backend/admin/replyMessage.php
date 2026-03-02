<?php
session_start();
include("../headers.php");
include("../config/db.php");

// Ensure only admin can reply
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => false, "message" => "Unauthorized access"]);
    exit;
}

// Notification helper
function createNotification($conn, $user_id, $role, $type, $title, $message) {
    $stmt = $conn->prepare("
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->bind_param("isss", $user_id, $type, $title, $message);
    $stmt->execute();
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$message_id = isset($data['message_id']) ? intval($data['message_id']) : 0;
$reply_content = isset($data['reply_content']) ? trim($data['reply_content']) : '';

// Validation
if ($message_id <= 0 || empty($reply_content)) {
    echo json_encode(["status" => false, "message" => "Invalid input data"]);
    exit;
}

try {
    // Fetch the message to get the user info
    $stmt = $conn->prepare("SELECT id, email, name FROM contact_messages WHERE id=?");
    $stmt->bind_param("i", $message_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $message = $result->fetch_assoc();
    $stmt->close();

    if (!$message) {
        echo json_encode(["status" => false, "message" => "Message not found"]);
        exit;
    }

    // Update the reply and status
    $stmt = $conn->prepare("UPDATE contact_messages SET reply=?, status='Replied' WHERE id=?");
    $stmt->bind_param("si", $reply_content, $message_id);
    $stmt->execute();
    $stmt->close();

    // Create notification for the customer
    // Assuming the notifications table has: user_id, type, title, message
    // And the contact_messages table stores id for message
    // We need the customer's user_id. If you only have email, you can fetch user_id from users table
    $stmt = $conn->prepare("SELECT id FROM users WHERE email=? AND role='customer'");
    $stmt->bind_param("s", $message['email']);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();
    $stmt->close();

    if ($user) {
        createNotification(
            $conn,
            $user['id'],
            'customer',
            'reply',
            'Admin Replied to Your Inquiry',
            "Admin has replied to your message: {$reply_content}"
        );
    }

    // Return success response
    echo json_encode(["status" => true, "message" => "Reply updated and customer notified successfully"]);

} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>