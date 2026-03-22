BtnLogin.addEventListener("click", Login);

function Login(){
    //Collect username and password
    const userName = document.getElementById("userName");
    const userPass = document.getElementById("userPass");
    const readName = userName.value;
    const readPass = userPass.value;
    const userList = [{username:"admin",password:"password"},{username:"admin2",password:"password2"}];
    const failLogin = document.getElementById("failLogin");
    
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
            failLogin.textContent = "Please enter valid credentials";
        }
    //if user enters nothing clear entries and ask them to do something
    }else{
        userName.value = "";
        userPass.value = "";
        failLogin.textContent = "Please enter anything";
    }
}

