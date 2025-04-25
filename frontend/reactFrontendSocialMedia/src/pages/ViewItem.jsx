import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const hashStringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }

    // Convert the hash to a color by using the hash value to generate RGB
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    
    // Return the color in hex format
    return `#${(1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

function ItemDetails() {
    const [item, setItem] = useState(null);
    const navigate = useNavigate();
    const [titleColor, setTitleColor] = useState(null); // State to store the title color
    const { precordsid } = useParams(); // Use precordsid from the URL params
    const API_URL = "http://localhost:8001";
    const token = localStorage.getItem("accessToken");

    const styles = {
        pageContainer: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#f0f2f5',
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            overflowY: 'auto',
            padding: '20px',
            boxSizing: 'border-box',
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
        },
        title: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#1c1e21',
        },
        backButton: {
            padding: '10px 15px',
            backgroundColor: '#0095f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
        },
        itemInfo: {
            marginBottom: '20px',
        },
        postCard: {
            display: 'flex',
            flexDirection: 'row', // Align image and content side by side
            backgroundColor: 'white',
            border: '1px solid #dddfe2',
            borderRadius: '12px',
            boxShadow: '0 6px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            padding: '20px',
            marginTop: '20px',
            alignItems: 'center', // Align image and text vertically centered
        },
        itemImage: {
            width: '45%', // Increase the width of the image to 45% of the post card width
            height: 'auto', // Maintain aspect ratio
            maxHeight: '400px', // You can adjust this based on the size you want
            objectFit: 'contain', // Make sure the image is properly cropped and contained
            borderRadius: '8px',
            marginRight: '20px', // Add space between image and text
        },
        postCardContent: {
            flex: 1, // Content takes up the remaining space
            display: 'flex',
            flexDirection: 'column', // Stack the content vertically
        },
        itemDescription: {
            fontSize: '16px',
            color: '#1c1e21',
            fontFamily: '"Georgia", serif', // Professional serif font for description
            marginTop: '15px',
        },
        itemTitle: {
            fontSize: '28px', // Larger font size for the item title
            fontWeight: '600',
            color: titleColor,
            fontFamily: '"Georgia", serif',
            marginBottom: '2px',
        },
        metaInfo: {
            fontSize: '14px',
            color: '#65676b',
            marginTop: '3px',
            fontFamily: '"Georgia", serif',
            marginBottom: '3px',
        },
    };

    useEffect(() => {
        if (!token) {
            navigate("/");
        } else {
            fetchItemDetails();
        }
    }, [token, navigate, precordsid]);

    const fetchItemDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/items/${precordsid}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItem(response.data);

            // Generate a consistent color based on the item title or ID
            const randomColor = hashStringToColor(response.data.title); // Or use precordsid if you prefer
            setTitleColor(randomColor);

        } catch (error) {
            console.error("Error fetching item details:", error);
            alert("Failed to load item details.");
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Item Details</h2>
                    <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
                        Back to Dashboard
                    </button>
                </div>

                {item ? (
                    <div style={styles.itemInfo}>
                        <div style={styles.postCard}>
                            {item.presigned_image_url && (
                                <img
                                    src={item.presigned_image_url}
                                    alt={item.title}
                                    style={styles.itemImage}
                                />
                            )}
                            <div style={styles.postCardContent}>
                                <h3 style={styles.itemTitle}>{item.title}</h3>
                                <p style={styles.metaInfo}>
                                    <strong>By </strong> {item.author}
                                </p>
                                <p style={styles.itemDescription}>{item.description}</p>
                                <p style={styles.metaInfo}>
                                    <strong>Published Date:</strong> {new Date(item.publish_date).toLocaleDateString()}
                                </p>
                                <p style={styles.metaInfo}>
                                    <strong>Genre:</strong> {item.genre}</p>
                                <p style={styles.metaInfo}>
                                    <strong>Type:</strong> {item.type === 1 ? "Book" : "Unknown Type"}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Loading item details...</p>
                )}
            </div>
        </div>
    );
}

export default ItemDetails;
