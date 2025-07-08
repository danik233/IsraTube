// Get references to buttons and inputs
const signupBtn = document.getElementById("signupBtn");
const paidBtn = document.querySelector(".paid-btn");
const notPaidBtn = document.querySelector(".not-paid-btn");

// Variable to store paid status: true, false, or null if none selected
let paidStatus = null;

// Function to enable or disable signup button based on paidStatus selection
function updateSignupBtnState() {
    if (paidStatus !== null) {
        signupBtn.disabled = false;
        signupBtn.classList.add("enabled");
    } else {
        signupBtn.disabled = true;
        signupBtn.classList.remove("enabled");
    }
}

// Event listeners for paid buttons to toggle selection
paidBtn.addEventListener("click", () => {
    paidStatus = true;
    paidBtn.classList.add("selected");
    notPaidBtn.classList.remove("selected");
    updateSignupBtnState();
});

notPaidBtn.addEventListener("click", () => {
    paidStatus = false;
    notPaidBtn.classList.add("selected");
    paidBtn.classList.remove("selected");
    updateSignupBtnState();
});

// Async function to handle signup button click
async function handleSignup() {
    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passInput").value;
    const repeatPassword = document.getElementById("repeatPassInput").value;

    // Validate inputs are filled
    if (!email || !password || !repeatPassword) {
        alert("Please fill in all fields.");
        return;
    }

    // Validate paid status selected
    if (paidStatus === null) {
        alert("Please select Paid or Not Paid.");
        return;
    }

    // Send signup data to server
    const res = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, repeatPassword, paid: paidStatus, favArray: [] }),
    });

    const data = await res.json();

    // Show success or failure message based on response
    if (res.ok) {
        alert("Signup successful!");
        window.location.href = "index.html"; // Redirect to login page after signup
    } else {
        alert(data.message || "Signup failed.");
    }
}

// Attach click event to signup button
signupBtn.addEventListener("click", handleSignup);

// Allow Enter key on inputs to trigger signup
["emailInput", "passInput", "repeatPassInput"].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            handleSignup();
        }
    });
});

// Navigate back to login page on clicking the span
const gotoLogin = document.getElementById("gotoLogin");
gotoLogin.addEventListener("click", () => {
    window.location.href = "index.html";
});

// Initialize signup button state on page load
updateSignupBtnState();