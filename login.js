function loginUser() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const validationMessage = document.getElementById("validationMessage");

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // --- Constant Credentials ---
    const admins = {
        "admin1": "pass123",
        "admin2": "pass456"
    };
    const students = {
        "student1": "pass789",
        "student2": "pass101"
    };
    // --------------------------

    validationMessage.textContent = ""; // Clear previous messages

    if (!username || !password) {
        validationMessage.textContent = "Please enter both username and password.";
        return;
    }

    if (admins[username] && admins[username] === password) {
        // Admin Login Successful
        sessionStorage.setItem('loggedInUser', username); // Store username
        sessionStorage.setItem('userRole', 'admin');     // Store role
        window.location.href = "admin.html"; // Redirect to Admin Page
    } else if (students[username] && students[username] === password) {
        // Student Login Successful
        sessionStorage.setItem('loggedInUser', username); // Store username
        sessionStorage.setItem('userRole', 'student');   // Store role
        window.location.href = "student.html"; // Redirect to Student Page
    } else {
        // Invalid Credentials
        validationMessage.textContent = "Invalid username or password.";
        passwordInput.value = ""; // Clear password field
    }
}

// Optional: Allow login on pressing Enter in password field
document.getElementById('password').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        loginUser();
    }
});