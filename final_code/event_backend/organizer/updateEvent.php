<?php
session_start();
include("../headers.php");
include("../config/db.php");

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

$event_id    = $_POST['event_id'];
$title       = trim($_POST['title']);
$date_time   = $_POST['date_time'];
$location    = trim($_POST['location']);
$city        = trim($_POST['city']);
$category_id = $_POST['category_id'];
$description = trim($_POST['description']);
$event_type = $_POST['event_type'] ?? 'free';
$price = $_POST['price'] ?? 0;


// validation
if ($event_type === 'paid' && $price <= 0) {
  echo json_encode([
    "status" => false,
    "message" => "Price required for paid events"
  ]);
  exit;
}

if ($event_type === 'free') {
  $price = 0;
}



/* status check */
$checkQuery = "SELECT status, poster FROM events WHERE id=? AND organizer_id=?";
$stmt = mysqli_prepare($conn, $checkQuery);
mysqli_stmt_bind_param($stmt, "ii", $event_id, $organizer_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
  echo json_encode(["status" => false, "message" => "Event not found"]);
  exit;
}

$event = mysqli_fetch_assoc($result);

if (in_array($event['status'], ['approved', 'cancelled'])) {
  echo json_encode(["status" => false, "message" => "This event cannot be edited"]);
  exit;
}

/* poster upload */
$posterName = $event['poster'];

if (!empty($_FILES['poster']['name'])) {
 $originalName = basename($_FILES['poster']['name']);
$cleanName = preg_replace("/[^a-zA-Z0-9._-]/", "", $originalName);
$posterName = time() . "_" . $cleanName;
  move_uploaded_file(
    $_FILES['poster']['tmp_name'],
    "../uploads/events/" . $posterName
  );
}

/* update event */
$updateQuery = "
  UPDATE events SET
    title=?,
    date_time=?,
    location=?,
    city=?,
    category_id=?,
    description=?,
    poster=?,
    event_type=?,
    price=?
  WHERE id=? AND organizer_id=?
";


$stmt = mysqli_prepare($conn, $updateQuery);

mysqli_stmt_bind_param(
  $stmt,
  "ssssisssdii",
  $title,
  $date_time,
  $location,
  $city,
  $category_id,
  $description,
  $posterName,
  $event_type,
  $price,
  $event_id,
  $organizer_id
);



if (mysqli_stmt_execute($stmt)) {
  echo json_encode(["status" => true, "message" => "Event updated successfully"]);
} else {
  echo json_encode(["status" => false, "message" => "Failed to update event"]);
}
