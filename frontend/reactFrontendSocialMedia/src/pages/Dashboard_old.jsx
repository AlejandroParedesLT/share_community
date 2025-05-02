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
            backgroundColor: '#0077cc',
            transform: 'scale(1.05)',
        },
        pizzaLeft: {
            position: 'absolute',
            left: '5%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '300px',
            height: '350px',
            animation: 'bouncePizzaLeft 2s ease-in-out infinite',
            zIndex: 1,
        },
        pizzaRight: {
            position: 'absolute',
            right: '5%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '300px',
            height: '350px',
            animation: 'bouncePizzaRight 2.5s ease-in-out infinite',
            zIndex: 1,
        }
    };

    const pizzaImageUrl = "https://i.pinimg.com/736x/12/1e/3c/121e3c7353b6c0c7ed5b8913918bc8bc.jpg";
    const pizzaCount = 2; // Number of pizzas on each side

    return (
        <div style={styles.pageContainer}>
            <style>
                {`
                    @keyframes rainbowText {
                        0% { filter: hue-rotate(0deg); }
                        100% { filter: hue-rotate(360deg); }
                    }
                    
                    @keyframes bouncePizzaLeft {
                        0%, 100% { transform: translate(0, -50%); }
                        50% { transform: translate(0, -70%); }
                    }
                    
                    @keyframes bouncePizzaRight {
                        0%, 100% { transform: translate(0, -50%); }
                        50% { transform: translate(0, -70%); }
                    }
                `}
            </style>

            {/* Pizzas on the left */}
            {[...Array(pizzaCount)].map((_, i) => (
                <div 
                    key={`left-pizza-${i}`} 
                    style={{
                        ...styles.pizzaLeft,
                        left: `${5 + (0 * 7)}%`,
                        top: `${25 + (i * 60)}%`,
                        fontSize: `${40 + (i * 10)}px`,
                        animationDelay: `${i * 0.3}s`
                    }}
                >
                    <img src={pizzaImageUrl} alt="Pizza" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            ))}

            {/* Pizzas on the right */}
            {[...Array(pizzaCount)].map((_, i) => (
                <div 
                    key={`right-pizza-${i}`} 
                    style={{
                        ...styles.pizzaRight,
                        right: `${5 + (0 * 7)}%`,
                        top: `${20 + (i * 60)}%`,
                        fontSize: `${40 + (i * 10)}px`,
                        animationDelay: `${i * 0.3}s`
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
                        onClick={() => navigate("/create-post")}
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