document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const loginMessage = document.getElementById("loginMessage");

    loginBtn.addEventListener("click", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/login", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        // Redirect on success
                        window.location.href = "/inventory";
                    } else {
                        // Show error message
                        loginMessage.textContent = response.message;
                    }
                } else {
                    loginMessage.textContent = "Server error. Try again later.";
                }
            }
        };

        const loginData = JSON.stringify({ email, password });
        xhr.send(loginData);
    });
});
