<?php
include("../headers.php");
include("../config/db.php");
require "../includes/notifications.php";

header("Content-Type: application/json");

try {
    // Get all upcoming approved events
    $sql = "SELECT id, title, date_time 
            FROM events 
            WHERE status='approved' 
            AND date_time >= NOW() 
            ORDER BY date_time ASC";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $notificationsCreated = 0;

    while ($event = $result->fetch_assoc()) {
        $event_id = $event['id'];
        $event_title = $event['title'];

        // Check if notification already exists for this event
        $checkStmt = $conn->prepare("
            SELECT id 
            FROM notifications
            WHERE type='upcoming_event' 
            AND event_id = ?
        ");
        $checkStmt->bind_param("i", $event_id);
        $checkStmt->execute();
        $checkRes = $checkStmt->get_result();

        if ($checkRes->num_rows === 0) {
            // Create a single notification for the event
            createNotification(
                $conn,
                null, // user_id null since sent to all
                'customer',
                'upcoming_event',
                'Upcoming Event Alert',
                "Event '{$event_title}' is coming up soon! Book your seat now.",
                $event_id
            );
            $notificationsCreated++;
        }
    }

    echo json_encode([
        "status" => true,
        "message" => "Upcoming notifications processed",
        "created" => $notificationsCreated
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}
?>

<?php
function createNotification($conn, $user_id, $role, $type, $title, $message, $event_id = null) {
    $stmt = $conn->prepare("
        INSERT INTO notifications (user_id, type, title, message, event_id)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("isssi", $user_id, $type, $title, $message, $event_id);
    $stmt->execute();
}
?>