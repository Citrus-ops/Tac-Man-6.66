function Footer(){
    return(<div>
        <footer>
            &copy; Ryan, Zane, Storm Conestoga College 2026
        </footer>
    </div>
    );
}

// Find the DOM container element by its ID
const domNode = document.getElementById('reactFooter');

// Create a React root and render your component inside the container
const root = ReactDOM.createRoot(domNode);
root.render(<Footer />);