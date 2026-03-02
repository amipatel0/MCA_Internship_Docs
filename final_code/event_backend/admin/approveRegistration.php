<?php
session_start();
include "../headers.php";
include "../config/db.php";

header("Content-Type: application/json");

$conn->begin_transaction();

try {

    $registration_id = (int)($_POST['registration_id'] ?? 0);

    $stmt = $conn->prepare("
        SELECT er.event_id, er.status, e.available_seats, e.price
        FROM event_registrations er
        JOIN events e ON er.event_id=e.id
        WHERE er.id=? FOR UPDATE
    ");
    $stmt->bind_param("i",$registration_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row) throw new Exception("Registration not found");
    if ($row['status']!='pending') throw new Exception("Already processed");

    if ($row['available_seats'] <= 0)
        throw new Exception("Seats full");

    /* FREE EVENT */
    if ($row['price'] == 0) {

        $new_status = "confirmed";

        /* Seat decrease here */
        $updateSeat = $conn->prepare("
            UPDATE events 
            SET available_seats = available_seats - 1
            WHERE id=?
        ");
        $updateSeat->bind_param("i",$row['event_id']);
        $updateSeat->execute();
    }
    else {
        /* PAID EVENT */
        $new_status = "pending_payment";
        /* NO seat decrease here */
    }

    $updateReg = $conn->prepare("
        UPDATE event_registrations 
        SET status=? 
        WHERE id=?
    ");
    $updateReg->bind_param("si",$new_status,$registration_id);
    $updateReg->execute();

    $conn->commit();

    echo json_encode([
        "status"=>true,
        "message"=>"Registration approved successfully"
    ]);

} catch(Exception $e){
    $conn->rollback();
    echo json_encode(["status"=>false,"message"=>$e->getMessage()]);
}
exit;
