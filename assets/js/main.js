// Setup a global Axios instance with a base URL
const api = axios.create({
    // IMPORTANT: Adjust this URL to match your XAMPP setup.
    // It's the path to your 'api' folder.
    baseURL: '/GoldenBite/api/',
    
    // This tells Axios to send cookies (like the PHP session ID) with each request.
    // It's essential for keeping users logged in.
    withCredentials: true
});