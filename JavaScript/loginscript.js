const BtnLogin = document.getElementById("BtnLogin");
const BtnSignUp = document.getElementById("BtnSignUp");
BtnSignUp.addEventListener("click", SignUp);
BtnLogin.addEventListener("click", Login);
const userList = [{username:"admin",password:"password"},{username:"admin2",password:"password2"}];

function Login(){
    //Collect username and password
    const userName = document.getElementById("userName");
    const userPass = document.getElementById("userPass");
    const readName = userName.value;
    const readPass = userPass.value;
    
    //Make sure there is something in the input
    if (readName !== "" && readPass !== ""){
        
        console.log("step one")
        //Find a matching user and password
        const user = userList.find(user => {
        return user.username === readName && user.password === readPass;
        });
        // If user is valid go to index
        if(user){
            location.href = "index.html"
        }else{
            userName.value = "";
            userPass.value = "";
            alert("Please enter valid credentials");
        }
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

