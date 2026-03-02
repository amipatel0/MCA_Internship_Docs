<?php
session_start();
header("Content-Type: application/json");
include("../headers.php");
include("../config/db.php");
require "../includes/notifications.php";

// User must be logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

// Only organizers allowed
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'organizer') {
    echo json_encode([
        "status" => false,
        "message" => "Access denied: Only organizers can access this resource"
    ]);
    exit;
}
$organizer_id = $_SESSION['user_id'];

/* inputs  */
$title       = trim($_POST['title'] ?? '');
$date_time   = $_POST['date_time'] ?? '';
$location    = trim($_POST['location'] ?? '');
$city        = trim($_POST['city'] ?? '');
$category_id = $_POST['category_id'] ?? '';
$description = trim($_POST['description'] ?? '');
$event_type = $_POST['event_type'] ?? 'free'; // free | paid
$price      = $_POST['price'] ?? 0;
$total_seats = intval($_POST['total_seats'] ?? 0);



/* Validations  */
if (
    $title === '' ||
    $date_time === '' ||
    $location === '' ||
    $city === '' ||
    $category_id === '' ||
    $description === ''
) {
    echo json_encode([
        "status" => false,
        "message" => "All fields are required"
    ]);
    exit;
}
// event type
if (!in_array($event_type, ['free', 'paid'])) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid event type"
    ]);
    exit;
}

if ($event_type === 'paid' && ($price <= 0)) {
    echo json_encode([
        "status" => false,
        "message" => "Price is required for paid events"
    ]);
    exit;
}

if ($event_type === 'free') {
    $price = 0; // force free events to 0
}
if ($total_seats <= 0) {
    echo json_encode([
        "status" => false,
        "message" => "Total seats must be greater than 0"
    ]);
    exit;
}
$available_seats = $total_seats;

/* poster upload */
if (!isset($_FILES['poster']) || $_FILES['poster']['error'] !== 0) {
    echo json_encode([
        "status" => false,
        "message" => "Poster is required"
    ]);
    exit;
}

$uploadDir = "../uploads/events/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$originalName = basename($_FILES['poster']['name']);
$cleanName = preg_replace("/[^a-zA-Z0-9._-]/", "", $originalName);
$posterName = time() . "_" . $cleanName;
$targetPath = $uploadDir . $posterName;

if (!move_uploaded_file($_FILES['poster']['tmp_name'], $targetPath)) {
    echo json_encode([
        "status" => false,
        "message" => "Poster upload failed"
    ]);
    exit;
}

/* insert event */
$status = 'pending'; //initial status pending after admin approval it will be approved and visible to customers


$stmt = $conn->prepare("
    INSERT INTO events 
    (
      organizer_id,
      category_id,
      title,
      date_time,
      location,
      city,
      description,
      poster,
      event_type,
      price,
      total_seats,
      available_seats,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)
");




$stmt->bind_param(
    "iisssssssdiis",
    $organizer_id,
    $category_id,
    $title,
    $date_time,
    $location,
    $city,
    $description,
    $posterName,
    $event_type,
    $price,
    $total_seats,
    $available_seats,
    $status
);



if ($stmt->execute()) {

    $event_id = $stmt->insert_id;

    /* NOTIFY ALL ADMINS*/
    $adminQuery = $conn->query("SELECT id FROM users WHERE role='admin'");
    while ($admin = $adminQuery->fetch_assoc()) {

        createNotification(
            $conn,
            $admin['id'],
            'admin',
            'event_created',
            'New Event Created',
            "New event '{$title}' created by organizer. Please review and approve."
        );
    }

    echo json_encode([
        "status" => true,
        "message" => "Event created successfully and is pending approval"
    ]);
}else {
    echo json_encode([
        "status" => false,
        "message" => "Failed to create event"
    ]);
}
