<?php
ob_start();
session_start();

include "../headers.php";
include "../config/db.php";
include 'phpqrcode/qrlib.php';

$path = __DIR__ . '/images/';
if (!is_dir($path)) mkdir($path, 0777, true);





// Login check
if (!isset($_SESSION['user_id'])) {
    echo "Please login to download ticket.";
    exit;
}

$user_id = $_SESSION['user_id'];

// reg_id required
if (!isset($_GET['reg_id'])) {
    echo "Invalid ticket request.";
    exit;
}

$reg_id = intval($_GET['reg_id']);

// Include FPDF library
require(__DIR__ . '/fpdf/fpdf.php');

// Fetch ticket
$stmt = $conn->prepare("
    SELECT 
        r.ticket_id,
        e.title,
        e.date_time,
        e.location
    FROM event_registrations r
    JOIN events e ON e.id = r.event_id
    WHERE r.id = ? AND r.user_id = ?
    LIMIT 1
");
$stmt->bind_param("ii", $reg_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "Ticket not found or access denied.";
    exit;
}

$ticket = $result->fetch_assoc();
$eventDate = date("d M Y, h:i A", strtotime($ticket['date_time']));

//  ticket ID for filename
$ticketIdSafe = preg_replace('/[^A-Za-z0-9_-]/', '_', $ticket['ticket_id']);

// QR file saved in images folder using ticket ID
$qrFile = $path . $ticketIdSafe . '.png';

// QR with ticket ID
$qrData = $ticket['ticket_id'];

// Generate QR code
QRcode::png($qrData, $qrFile, 'L', 10, 4);


$pdf = new FPDF('P', 'mm', 'A4');
$pdf->AddPage();

// Ticket border
$pdf->Rect(15, 20, 180, 250);

// Header
$pdf->SetFont('Arial', 'B', 20);
$pdf->SetXY(15, 25);
$pdf->Cell(180, 15, 'EVENT ENTRY TICKET', 0, 1, 'C');

// Divider
$pdf->Line(25, 45, 185, 45);

// Event Title
$pdf->SetFont('Arial', 'B', 16);
$pdf->SetXY(25, 50);
$pdf->MultiCell(160, 10, $ticket['title']);

// Details
$pdf->SetFont('Arial', '', 12);
$pdf->SetXY(25, 75);
$pdf->Cell(50, 8, 'Date & Time:', 0, 0);
$pdf->Cell(0, 8, $eventDate, 0, 1);

$pdf->SetX(25);
$pdf->Cell(50, 8, 'Venue:', 0, 0);
$pdf->Cell(0, 8, $ticket['location'], 0, 1);

// Divider
$pdf->Line(25, 100, 185, 100);

// Ticket ID
$pdf->SetFont('Arial', 'B', 14);
$pdf->SetXY(25, 105);
$pdf->Cell(0, 10, 'Ticket ID', 0, 1);

$pdf->SetFont('Courier', 'B', 18);
$pdf->SetFillColor(230, 230, 230);
$pdf->SetX(25);
$pdf->Cell(160, 15, $ticket['ticket_id'], 1, 1, 'C', true);

// QR Code 
$pdf->Image($qrFile, 70, 150, 70, 70); // X, Y, width, height

// Footer
$pdf->SetY(-40);
$pdf->SetFont('Arial', 'I', 10);
$pdf->Cell(0, 10, 'Thank you for registering. Enjoy the event!', 0, 1, 'C');

// Download PDF
$filename = "Ticket_" . preg_replace("/[^a-zA-Z0-9]/", "_", $ticket['title']) . ".pdf";
$pdf->Output('D', $filename);

exit;
