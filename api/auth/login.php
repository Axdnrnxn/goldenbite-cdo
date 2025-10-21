<?php
// Start a session. This must be the very first thing in your script.
session_start();

// Include the database connection
include_once '../config/db.php';

// Get the data sent from the frontend
$data = json_decode(file_get_contents("php://input"));

// Check if email and password are provided
if (!empty($data->email) && !empty($data->password)) {
    // Query to find the user by email
    $query = "SELECT id, full_name, email, password FROM customers WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);

    // Sanitize the email input
    $email = htmlspecialchars(strip_tags($data->email));
    $stmt->bindParam(':email', $email);
    
    $stmt->execute();
    $num = $stmt->rowCount();

    // Check if a user with that email was found
    if ($num > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $hashed_password = $row['password'];

        // Verify the provided password against the hashed password from the database
        if (password_verify($data->password, $hashed_password)) {
            // Passwords match! Create the session variables.
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_name'] = $row['full_name'];
            
            // Send a success response back to the frontend
            http_response_code(200);
            echo json_encode([
                "message" => "Login successful.",
                "user" => [
                    "id" => $row['id'],
                    "fullName" => $row['full_name'],
                    "email" => $row['email']
                ]
            ]);
        } else {
            // Passwords do not match
            http_response_code(401); // 401 Unauthorized
            echo json_encode(["message" => "Invalid password."]);
        }
    } else {
        // No user found with that email
        http_response_code(404); // 404 Not Found
        echo json_encode(["message" => "User not found."]);
    }
} else {
    // Data is incomplete
    http_response_code(400); // 400 Bad Request
    echo json_encode(["message" => "Incomplete data. Please provide email and password."]);
}
?>