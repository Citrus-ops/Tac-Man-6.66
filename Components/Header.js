function Header() {
    const path = window.location.pathname;
    const hideLogout = path.includes("login");

    return (
        <div className="header-wrapper">
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

    <div className="heading">
        <h1>Tac-Man Manager</h1>
        <img src="images/Tac-man.png" alt="Tac-man logo" />
    </div>
</div>
    );
}
