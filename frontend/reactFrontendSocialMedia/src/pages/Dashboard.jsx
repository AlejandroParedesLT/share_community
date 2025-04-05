import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Dashboard() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("User");

    useEffect(() => {
        // Try to get username from local storage
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const styles = {
        pageContainer: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#f0f2f5',
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            border: '1px solid #dddfe2',
            borderRadius: '12px',
            boxShadow: '0 6px 8px rgba(0,0,0,0.1)',
            padding: '30px',
            textAlign: 'center',
        },
        title: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#1c1e21',
            marginBottom: '30px',
        },
        welcomeSubtitle: {
            fontSize: '18px',
            color: '#65676b',
            marginBottom: '20px',
        },
        buttonContainer: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
        },
        button: {
            backgroundColor: '#0095f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '15px 20px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
        },
        buttonHover: {
            backgroundColor: '#0077cc',
            transform: 'scale(1.05)',
        }
    };

    const handleNavigateWithHover = (navigateFn) => {
        navigateFn();
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                <h2 style={styles.title}>Welcome, {username}</h2>
                <p style={styles.welcomeSubtitle}>What would you like to do today?</p>
                <div style={styles.buttonContainer}>
                    <button
                        onClick={() => handleNavigateWithHover(() => navigate("/items"))}
                        style={styles.button}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                            e.target.style.transform = styles.buttonHover.transform;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = styles.button.backgroundColor;
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        Go to Items
                    </button>
                    <button
                        onClick={() => handleNavigateWithHover(() => navigate("/post-item"))}
                        style={styles.button}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                            e.target.style.transform = styles.buttonHover.transform;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = styles.button.backgroundColor;
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        Post New Item
                    </button>
                    <button
                        onClick={() => handleNavigateWithHover(() => navigate("/posts"))}
                        style={styles.button}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                            e.target.style.transform = styles.buttonHover.transform;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = styles.button.backgroundColor;
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        View Posts
                    </button>
                    <button
                        onClick={() => handleNavigateWithHover(() => navigate("/create-post"))}
                        style={styles.button}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                            e.target.style.transform = styles.buttonHover.transform;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = styles.button.backgroundColor;
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        Create New Post
                    </button>
                    {/* New Genre buttons */}
                    <button
                        onClick={() => handleNavigateWithHover(() => navigate("/post-genre"))}
                        style={styles.button}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                            e.target.style.transform = styles.buttonHover.transform;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = styles.button.backgroundColor;
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        Post Genre
                    </button>
                    <button
                        onClick={() => handleNavigateWithHover(() => navigate("/view-genre"))}
                        style={styles.button}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                            e.target.style.transform = styles.buttonHover.transform;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = styles.button.backgroundColor;
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        Genre
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
