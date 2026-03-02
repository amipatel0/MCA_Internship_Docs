<?php
session_start();
include("../headers.php");
include("../config/db.php");

header("Content-Type: application/json");

// Authentication check
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

// Role check
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'organizer') {
    echo json_encode([
        "status" => false,
        "message" => "Access denied"
    ]);
    exit;
}

$organizer_id = $_SESSION['user_id'];
$today = date('Y-m-d');



// Total Events
$stmt = $conn->prepare("SELECT COUNT(*) as total FROM events WHERE organizer_id = ?");
$stmt->bind_param("i", $organizer_id);
$stmt->execute();
$totalEvents = $stmt->get_result()->fetch_assoc()['total'];

// Upcoming Events
$stmt = $conn->prepare("
    SELECT COUNT(*) as total 
    FROM events 
    WHERE organizer_id = ? AND DATE(date_time) > ?
");
$stmt->bind_param("is", $organizer_id, $today);
$stmt->execute();
$upcomingEvents = $stmt->get_result()->fetch_assoc()['total'];

// Past Events
$stmt = $conn->prepare("
    SELECT COUNT(*) as total 
    FROM events 
    WHERE organizer_id = ? AND DATE(date_time) < ?
");
$stmt->bind_param("is", $organizer_id, $today);
$stmt->execute();
$pastEvents = $stmt->get_result()->fetch_assoc()['total'];

// Total Registrations
$stmt = $conn->prepare("
    SELECT COUNT(*) as total 
    FROM event_registrations r
    JOIN events e ON r.event_id = e.id
    WHERE e.organizer_id = ?
");
$stmt->bind_param("i", $organizer_id);
$stmt->execute();
$totalRegistrations = $stmt->get_result()->fetch_assoc()['total'];



$byStatus = [
    "approved" => 0,
    "pending"  => 0,
    "rejected" => 0
];

$stmt = $conn->prepare("
    SELECT status, COUNT(*) as total
    FROM events
    WHERE organizer_id = ?
    GROUP BY status
");
$stmt->bind_param("i", $organizer_id);
$stmt->execute();
$statusRes = $stmt->get_result();

while ($row = $statusRes->fetch_assoc()) {
    $byStatus[$row['status']] = (int)$row['total'];
}



$stmt = $conn->prepare("
    SELECT c.category_name AS category, COUNT(e.id) AS total
    FROM events e
    JOIN categories c ON e.category_id = c.id
    WHERE e.organizer_id = ?
    GROUP BY c.id
");
$stmt->bind_param("i", $organizer_id);
$stmt->execute();
$categoryRes = $stmt->get_result();

$byCategory = [];
while ($row = $categoryRes->fetch_assoc()) {
    $byCategory[] = $row;
}



$eventStats = [];

$stmt = $conn->prepare("
    SELECT id, title, total_seats, available_seats
    FROM events
    WHERE organizer_id = ?
");
$stmt->bind_param("i", $organizer_id);
$stmt->execute();
$events = $stmt->get_result();

while ($event = $events->fetch_assoc()) {

    // USERS LIST
    $usersStmt = $conn->prepare("
        SELECT u.name, u.email, r.registered_at, r.status
        FROM event_registrations r
        JOIN users u ON r.user_id = u.id
        WHERE r.event_id = ?
    ");
    $usersStmt->bind_param("i", $event['id']);
    $usersStmt->execute();
    $usersRes = $usersStmt->get_result();

    $users = [];
    $pendingSeats = 0;

    while ($u = $usersRes->fetch_assoc()) {
        if ($u['status'] === 'pending') {
            $pendingSeats++;
        }
        $users[] = $u;
    }

    $totalSeats     = (int)$event['total_seats'];
    $availableSeats = (int)$event['available_seats'];

    // Booked calculation (based on your manual seat system)
    if ($totalSeats > 0) {
        $bookedSeats = $totalSeats - $availableSeats;
    } else {
        // Unlimited event
        $bookedSeats = count($users);
        $availableSeats = null;
    }

    $eventStats[] = [
        "event_id"        => $event['id'],
        "title"           => $event['title'],
        "registrations"   => $bookedSeats,
        "total_seats"     => $totalSeats,
        "booked_seats"    => $bookedSeats,
        "pending_seats"   => $pendingSeats,
        "available_seats" => $availableSeats,
        "users"           => $users
    ];
}




echo json_encode([
    "status" => true,
    "data" => [
        "totalEvents"        => (int)$totalEvents,
        "upcomingEvents"     => (int)$upcomingEvents,
        "pastEvents"         => (int)$pastEvents,
        "totalRegistrations" => (int)$totalRegistrations,
        "byStatus"           => $byStatus,
        "byCategory"         => $byCategory,
        "eventStats"         => $eventStats
    ]
]);
