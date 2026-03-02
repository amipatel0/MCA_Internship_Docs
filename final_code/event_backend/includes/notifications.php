<?php
function createNotification($conn, $user_id, $role, $type, $title, $message) {
    $stmt = $conn->prepare("
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->bind_param("isss", $user_id, $type, $title, $message);
    $stmt->execute();
}
?>