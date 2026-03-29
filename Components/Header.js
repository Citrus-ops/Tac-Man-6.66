function Header(){
    return(
    <div class="heading">
        <h1>Tac-Man Manager</h1>
        <img src="images/Tac-man.png" alt="Tac-man logo"/>
    </div>);
}

// Find the DOM container element by its ID
const domNode = document.getElementById('reactHeader');

// Create a React root and render your component inside the container
const root = ReactDOM.createRoot(domNode);
root.render(<Header />);