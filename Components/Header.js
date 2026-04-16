function Header() {
    const path = window.location.pathname;
    const hideLogout = path.includes("login");

    return (
        <div className="heading">
            {!hideLogout && (
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

            <h1>Tac-Man Manager</h1>
            <img src="images/Tac-man.png" alt="Tac-man logo" />
        </div>
    );
}
