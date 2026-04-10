const BtnLogin = document.getElementById("BtnLogin");
const BtnSignUp = document.getElementById("BtnSignUp");
BtnSignUp.addEventListener("click", SignUp);
BtnLogin.addEventListener("click", Login);
const userList = [{username:"admin",password:"password"},{username:"admin2",password:"password2"}];

async function Login(){
    //Collect username and password
    const userName = document.getElementById("userName");
    const userPass = document.getElementById("userPass");
    const readName = userName.value;
    const readPass = userPass.value;
    
    //Make sure there is something in the input
    if (readName !== "" && readPass !== ""){
        
        console.log("step one")
            const { data, error } = await supabaseClient
                .from("users")
                .select("*")
                .eq("username", userName)
                .eq("password", userPass)
                .limit(1);

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
    //if user enters nothing clear entries and ask them to do something
    }else{
        userName.value = "";
        userPass.value = "";
        alert("Please enter anything");
    }
}

function SignUp(){
    const userName = document.getElementById("userName");
    const userPass = document.getElementById("userPass");
    const readName = userName.value;
    const readPass = userPass.value;
    //Make sure there is something in the input
    if (readName !== "" && readPass !== ""){
            console.log("step one")
            //Check if user already exists
            const userExists = userList.some(user => user.username === readName);
            if(!userExists){
                // If user doesn't exist, create new user
                userList.push({username: readName, password: readPass});
                userName.value = "";
                userPass.value = "";
                alert("Sign up successful!");
            }else{
                userName.value = "";
                userPass.value = "";
                alert("User already exists!");
            }
        }else{
            userName.value = "";
            userPass.value = "";
            alert("Please enter anything");
        }
    }

