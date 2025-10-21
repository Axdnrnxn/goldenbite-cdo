<?php
// Set headers for API
header("Access-Control-Allow-Origin: *"); // Allows access from any origin (for development)
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database Credentials
$host = "localhost";
$db_name = "goldenbite_db";
$username = "root";
$password = "";

$conn = null;

try {
    // Create a new PDO instance
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    
    // Set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch(PDOException $exception) {
    // On connection error, stop and show error message
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "Database connection failed: " . $exception->getMessage()]);
    exit();
}


?>