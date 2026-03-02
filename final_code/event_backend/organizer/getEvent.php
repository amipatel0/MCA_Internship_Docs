
<?php
session_start();
include("../headers.php");
include("../config/db.php");

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'organizer') {
    echo json_encode([
        "status" => false,
        "message" => "Unauthorized"
    ]);
    exit();
}

$id = $_GET['id'];
$organizer_id = $_SESSION['user_id'];

$stmt = $conn->prepare(
    "SELECT 
        events.*, 
        categories.category_name 
     FROM events 
     JOIN categories ON events.category_id = categories.id 
     WHERE events.id = ? AND events.organizer_id = ?"
);

$stmt->bind_param("ii", $id, $organizer_id);
$stmt->execute();

$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode([
        "status" => false,
        "message" => "Event not found"
    ]);
    exit();
}

echo json_encode([
    "status" => true,
    "event" => $res->fetch_assoc()
]);
