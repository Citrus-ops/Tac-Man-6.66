// --- SHOW LOGIN MODAL ---
// Displays the login/signup modal w/ custom message
function showLoginModal(message) {
    const modal = document.getElementById("loginModal");
    const text = document.getElementById("loginModalText");

    // Only shows modal if both elements exist
    if (modal && text) {
        text.textContent = message;
        modal.style.display = "flex";
    }
}
// --- CLOSE LOGIN ---
function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.style.display = "none";
}


// Wait for DOM to load

window.onload = () => {
    // Attach modal close button
    const closeBtn = document.getElementById("closeLoginModal");
    if (closeBtn) {
        closeBtn.onclick = closeLoginModal;
    }

    // Attach login + signup buttons
    const BtnLogin = document.getElementById("BtnLogin");
    const BtnSignUp = document.getElementById("BtnSignUp");

    if (BtnLogin) BtnLogin.addEventListener("click", Login);
    if (BtnSignUp) BtnSignUp.addEventListener("click", SignUp);
};


// LOGIN FUNCTION

async function Login() {
    const userName = document.getElementById("userName").value.trim();
    const userPass = document.getElementById("userPass").value.trim();

    // Checks if required fields both have inputs (throws error if not)
    if (!userName || !userPass) {
        showLoginModal("Please enter both fields");
        return;
    }

    console.log("Attempting login with:", userName, userPass);

    // Supabase for matching user + password
    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("username", userName)
        .eq("password", userPass)
        .limit(1);

    console.log("Supabase returned:", data, error);

    // Database error handling
    if (error) {
        console.error(error);
        showLoginModal("Database error");
        return;
    }
// If input matches an existing users info, logs them in
    if (data.length === 1) {
        localStorage.setItem("user_id", data[0].id);
        localStorage.setItem("username", data[0].username);
        location.href = "index.html";
    } else {
        // Throws error if credentials don't match
        showLoginModal("Invalid username or password");
    }
}


// SIGNUP FUNCTION

async function SignUp() {
    const userName = document.getElementById("userName").value.trim();
    const userPass = document.getElementById("userPass").value.trim();

    // Checks if required fields both have inputs (throws error if not)
    if (!userName || !userPass) {
        showLoginModal("Please enter both fields");
        return;
    }

// Checks if user already exists
    const { data: existing, error: checkError } = await supabaseClient
        .from("users")
        .select("id")
        .eq("username", userName)
        .eq("password", userPass)
        .limit(1);

    // Database error handling
    if (checkError) {
        console.error(checkError);
        showLoginModal("Database error while checking username");
        return;
    }

    // Prevents user from signing up if user exists already
    if (existing.length > 0) {
        showLoginModal("User already exists!");
        return;
    }

// Creates new user
    const { error } = await supabaseClient
        .from("users")
        .insert([{ username: userName, password: userPass }]);

    if (error) {
        console.error(error);
        showLoginModal("Error creating user");
        return;
    }

    // Displays success message + clears fields
    showLoginModal("Sign up successful! You can now log in.");
    document.getElementById("userName").value = "";
    document.getElementById("userPass").value = "";
}




