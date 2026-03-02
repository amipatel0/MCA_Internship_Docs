
<?php
session_start();
include "../headers.php";
include "../config/db.php";
require "../includes/notifications.php"; 

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $input = json_decode(file_get_contents('php://input'), true);

    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $message = trim($input['message'] ?? '');

    if (!$name || !$email || !$message) {
        echo json_encode(["status" => false, "message" => "All fields are required"]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => false, "message" => "Invalid email format"]);
        exit;
    }

    $status = "New";

    // Insert contact message
    $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, message, status, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param("ssss", $name, $email, $message, $status);

    if ($stmt->execute()) {
        $contact_id = $stmt->insert_id; // Get inserted message ID

        // ===== Notify all admins =====
        $adminQuery = $conn->query("SELECT id FROM users WHERE role='admin'");
        while ($admin = $adminQuery->fetch_assoc()) {
            createNotification(
                $conn,
                $admin['id'],
                'admin',
                'customer_message',
                'New Customer Message',
                "Customer '{$name}' sent a new message: '{$message}' (Email: {$email})"
            );
        }

        echo json_encode(["status" => true, "message" => "Message sent successfully!"]);

    } else {
        echo json_encode(["status" => false, "message" => "Failed to send message"]);
    }

    $stmt->close();
}
?>