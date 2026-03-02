<?php
session_start();
include "../headers.php";
include "../config/db.php";

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status"=>false,"message"=>"Login required"]);
    exit;
}

$user_id = $_SESSION['user_id'];

/* ROLE CHECK */
$role = $conn->query("SELECT role FROM users WHERE id=$user_id")->fetch_assoc();
if ($role['role'] !== 'admin') {
    echo json_encode(["status"=>false,"message"=>"Unauthorized"]);
    exit;
}

$sql = "
SELECT er.id, er.ticket_id, er.status, er.registered_at,
       u.name, u.email,
       e.title, e.date_time
FROM event_registrations er
JOIN users u ON er.user_id = u.id
JOIN events e ON er.event_id = e.id
WHERE er.status = 'pending'
";

$res = $conn->query($sql);
$data = [];
while($row = $res->fetch_assoc()){
    $data[] = $row;
}

echo json_encode($data);
?>
