<?php
// Include the database connection file
include_once '../config/db.php';

// Get the posted data (will be sent as JSON from the frontend)
$data = json_decode(file_get_contents("php://input"));

// Basic validation: Check if all required fields are present and not empty
if (
    !empty($data->fullName) &&
    !empty($data->email) &&
    !empty($data->password)
) {
    // SQL query to insert a new customer
    // Using named placeholders (:fullName) helps prevent SQL injection
    $query = "INSERT INTO customers (full_name, email, password) VALUES (:fullName, :email, :password)";

    // Prepare the query statement
    $stmt = $conn->prepare($query);

    // Sanitize user input to prevent XSS attacks or other malicious code
    $fullName = htmlspecialchars(strip_tags($data->fullName));
    $email = htmlspecialchars(strip_tags($data->email));

    // IMPORTANT: Never store plain text passwords. Hash the password.
    $password = password_hash($data->password, PASSWORD_BCRYPT);

    // Bind the sanitized data to the placeholders in the query
    $stmt->bindParam(":fullName", $fullName);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $password);

    // Execute the query and check if it was successful
    try {
        if ($stmt->execute()) {
            // If successful, send a 201 Created response
            http_response_code(201);
            echo json_encode(["message" => "Registration successful."]);
        }
    } catch (PDOException $e) {
        // Handle potential errors, like a duplicate email
        http_response_code(503); // Service Unavailable
        if ($e->getCode() == 23000) { // Integrity constraint violation (duplicate entry)
             echo json_encode(["message" => "This email is already registered."]);
        } else {
             echo json_encode(["message" => "Unable to register user."]);
        }
    }
} else {
    // If data is incomplete, send a 400 Bad Request response
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Please provide full name, email, and password."]);
}
?>