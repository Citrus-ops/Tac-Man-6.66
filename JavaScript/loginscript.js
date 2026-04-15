


const BtnLogin = document.getElementById("BtnLogin");
const BtnSignUp = document.getElementById("BtnSignUp");
BtnSignUp.addEventListener("click", SignUp);
BtnLogin.addEventListener("click", Login);
const userList = [{username:"admin",password:"password"},{username:"admin2",password:"password2"}];

async function Login() {
    
    const userName = document.getElementById("userName").value.trim();
    const userPass = document.getElementById("userPass").value.trim();

    if (!userName || !userPass) {
        alert("Please enter both fields");
        return;
    }

    // Query Supabase for matching user
    console.log("Attempting login with:", userName, userPass);

    const { data, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("username", userName)
    .eq("password", userPass)
    .limit(1);

    console.log("Supabase returned:", data, error);

    if (error) {
        console.error(error);
        alert("Database error");
        return;
    }

    if (data.length === 1) {
        // Save user ID so index.html knows who is logged in
        localStorage.setItem("user_id", data[0].id);
        localStorage.setItem("username", data[0].username);

        location.href = "index.html";
    } else {
        alert("Invalid username or password");
    }
    console.log("Login clicked");
}

async function SignUp() {
    const userName = document.getElementById("userName").value;
    const userPass = document.getElementById("userPass").value;

    if (!userName || !userPass) {
        alert("Please enter both fields");
        return;
    }

    // Check if username already exists
    const { data: existing, error: checkError } = await supabaseClient
        .from("users")
        .select("id")
        .eq("username", userName)
        .eq("password", userPass)
        .limit(1);

    if (checkError) {
        console.error(checkError);
        alert("Database error while checking username");
        return;
    }

    if (existing.length > 0) {
        alert("User already exists!");
        return;
    }

    // Insert new user
    const { data, error } = await supabaseClient
        .from("users")
        .insert([
            {
                username: userName,
                password: userPass
            }
        ]);

    if (error) {
        console.error(error);
        alert("Error creating user");
        return;
    }

    alert("Sign up successful! You can now log in.");
}
