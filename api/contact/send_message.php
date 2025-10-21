<?php
include_once '../config/db.php';

// Get the data sent from the frontend form
$data = json_decode(file_get_contents("php://input"));

// Validate the incoming data
if (
    !empty($data->name) &&
    !empty($data->email) &&
    !empty($data->message)
) {
    $query = "INSERT INTO messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)";
    $stmt = $conn->prepare($query);

    // Sanitize the input
    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $subject = htmlspecialchars(strip_tags($data->subject ?? 'No Subject')); // Use a default value if subject is not provided
    $message = htmlspecialchars(strip_tags($data->message));

    // Bind parameters
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':subject', $subject);
    $stmt->bindParam(':message', $message);

    // Execute the query
    if ($stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode(["message" => "Message sent successfully! We will get back to you soon."]);
    } else {
        http_response_code(503); // Service Unavailable
        echo json_encode(["message" => "Unable to send message at this time."]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "Incomplete data. Please fill in all required fields."]);
}
?>