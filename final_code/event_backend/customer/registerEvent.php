<?php
session_start();
include "../headers.php";
include "../config/db.php";
require "../includes/notifications.php";
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status"=>false,"message"=>"Login required"]);
    exit;
}

$user_id = $_SESSION['user_id'];
/* ROLE CHECK */
$roleQuery = $conn->prepare("SELECT role FROM users WHERE id = ?");
$roleQuery->bind_param("i", $user_id);
$roleQuery->execute();
$user = $roleQuery->get_result()->fetch_assoc();

if (!$user || $user['role'] !== 'customer') {
    echo json_encode([
        "status" => false,
        "message" => "Only customers can register"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$event_id = (int)($data['event_id'] ?? 0);

if ($event_id <= 0) {
    echo json_encode(["status"=>false,"message"=>"Invalid event"]);
    exit;
}

/* Duplicate check */
$check = $conn->prepare("
    SELECT id FROM event_registrations 
    WHERE user_id=? AND event_id=?
");
$check->bind_param("ii",$user_id,$event_id);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(["status"=>false,"message"=>"Already registered"]);
    exit;
}

$ticket_id = "TKT".$user_id.$event_id.time();
$status = "pending";

$stmt = $conn->prepare("
    INSERT INTO event_registrations
    (user_id,event_id,ticket_id,status)
    VALUES (?,?,?,?)
");
$stmt->bind_param("iiss",$user_id,$event_id,$ticket_id,$status);
$stmt->execute();
/*   GET EVENT + ORGANIZER*/
$eventStmt = $conn->prepare("SELECT title, organizer_id FROM events WHERE id=?");
$eventStmt->bind_param("i", $event_id);
$eventStmt->execute();
$eventData = $eventStmt->get_result()->fetch_assoc();

$event_title = $eventData['title'];
$organizer_id = $eventData['organizer_id'];

/* NOTIFY ADMIN*/
$adminQuery = $conn->query("SELECT id FROM users WHERE role='admin'");
while ($admin = $adminQuery->fetch_assoc()) {

    createNotification(
        $conn,
        $admin['id'],
        'admin',
        'new_registration',
        'New Registration',
        "New registration for event '{$event_title}'. Please review."
    );
}

/* NOTIFY ORGANIZER*/
createNotification(
    $conn,
    $organizer_id,
    'organizer',
    'event_registered',
    'New User Registered',
    "A user has registered for your event '{$event_title}'."
);
echo json_encode([
    "status"=>true,
    "message"=>"Registration submitted. Waiting for admin approval.",
    "ticket_id"=>$ticket_id
]);
exit;
