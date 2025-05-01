import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PostPostModal from "./PostPost";

function Dashboard() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("User");
    const [isModalOpen, setModalOpen] = useState(false);


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
            backgroundColor: '#c4ede7',
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden', // To contain the pizzas
            position: 'relative', // For absolute positioning of pizzas
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
            zIndex: 10, // Ensure the main content is above the decorative elements
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
        rainbowText: {
            backgroundImage: "linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 'bold',
            fontSize: '24px',
            display: 'inline-block',
            animation: 'rainbowText 3s linear infinite',
        },
        buttonContainer: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
        },
        button: {
            backgroundColor: '#3c413a',
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
            backgroundColor: '#7dacbf',
            transform: 'scale(1.05)',
        },
        pizza: {
            position: 'absolute',
            width: '100px',
            height: '100px',
            objectFit: 'cover',
            zIndex: 1,
            animation: 'fallingPizza 4s linear infinite',
        },
    };

    const pizzaImageUrl = "https://png.pngtree.com/png-clipart/20230810/original/pngtree-whole-pizza-theme-image-1-salami-round-clipart-vector-picture-image_10258146.png";
    const pizzaCount = 7; // Number of pizzas raining down

    return (
        <div style={styles.pageContainer}>
            <style>
                {`
                    @keyframes rainbowText {
                        0% { filter: hue-rotate(0deg); }
                        100% { filter: hue-rotate(360deg); }
                    }

                    @keyframes fallingPizza {
                        0% {
                            transform: translateY(-120vh) rotate(0deg); /* Start from above the viewport */
                        }
                        100% {
                            transform: translateY(100vh) rotate(360deg); /* End at the bottom of the page */
                        }
                    }
                `}
            </style>

            {/* Show the post modal if open */}
            <PostPostModal 
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                navigate={navigate}
            />


            {/* Pizzas falling */}
            {[...Array(pizzaCount)].map((_, i) => (
                <div
                    key={`pizza-${i}`}
                    style={{
                        ...styles.pizza,
                        left: `${Math.random() * 100 - 5}%`, // Randomize the starting position
                        animationDuration: `${Math.random() * 10 + 5}s`, // Vary animation speed
                        animationDelay: `${Math.random() * 3}s`, // Random delay for staggered start
                    }}
                >
                    <img src={pizzaImageUrl} alt="Pizza" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            ))}

            <div style={styles.container}>
                <h2 style={styles.title}>
                     Welcome to your slice of life, <span style={styles.rainbowText}>{username}!</span> 
                </h2>
                <p style={styles.welcomeSubtitle}>What are you in the mood for today?</p>
                <div style={styles.buttonContainer}>
                    <button
                        onClick={() => navigate("/items")}
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
                        View Our Item Catalog
                    </button>
                    <button
                        onClick={() => navigate("/post-item")}
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
                        Suggest a New Item
                    </button>
                    <button
                        onClick={() => navigate("/posts")}
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
                        View Your Feed
                    </button>
                    <button
                        onClick={() => setModalOpen(true)}
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
                        Make a Post!
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
