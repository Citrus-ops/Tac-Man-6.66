function Header(){
    return(
    <div class="heading">
        <button 
            className="logout-btn"
            onClick={() => {
                localStorage.removeItem("user_id");
                window.location.href = "login.html";
            }}
    >
        Logout
    </button>
        <h1>Tac-Man Manager</h1>
        <img src="images/Tac-man.png" alt="Tac-man logo"/>
    </div>);
}

// Find the DOM container element by its ID
const domNode = document.getElementById('reactHeader');

// Create a React root and render your component inside the container
const root = ReactDOM.createRoot(domNode);
root.render(<Header />);


// Hide Logout Button on Login Page
onst userId = localStorage.getItem("user_id");

return (
    <header className="app-header">
        {userId && (
            <button 
                className="logout-btn"
                onClick={() => {
                    localStorage.removeItem("user_id");
                    window.location.href = "login.html";
                }}
            >
                Logout
            </button>
        )}

        <h1>Tac-Man</h1>
    </header>
);
