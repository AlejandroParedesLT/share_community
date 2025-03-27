import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Posts() {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    const API_URL = "http://localhost:8001";
    const token = localStorage.getItem("accessToken");

    // Color palette for avatars
    const avatarColors = [
        '#0095f6',   // Original blue
        '#5B4FD8',   // Purple
        '#E1306C',   // Instagram pink
        '#FF6B6B',   // Coral red
        '#4ECDC4',   // Teal
        '#45B7D1',   // Bright blue
        '#F9D56E',   // Soft yellow
        '#FF8C42',   // Orange
        '#6A5ACD',   // Slate blue
        '#2A9D8F',   // Teal green
    ];

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
        gridContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
        },
        postCard: {
            backgroundColor: 'white',
            border: '1px solid #dddfe2',
            borderRadius: '12px',
            boxShadow: '0 6px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease',
        },
        postCardHover: {
            transform: 'scale(1.02)',
        },
        postImage: {
            width: '100%',
            height: '250px',
            objectFit: 'cover',
        },
        postContent: {
            padding: '20px',
        },
        postTitle: {
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#1c1e21',
        },
        postMeta: {
            fontSize: '14px',
            color: '#65676b',
            marginBottom: '15px',
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '15px',
        },
        userAvatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            marginRight: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
        },
        postText: {
            color: '#1c1e21',
            marginBottom: '15px',
        },
        associatedItemsTitle: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#1c1e21',
        },
        associatedItem: {
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'black',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '10px',
        },
        associatedItemImage: {
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            marginLeft: '10px',
            borderRadius: '8px',
        },
        noPostsMessage: {
            textAlign: 'center',
            color: '#65676b',
            fontSize: '18px',
            marginTop: '50px',
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/");
        } else {
            fetchPosts();
        }
    }, [token, navigate]);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/posts/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const postsData = response.data.results || response.data;
            
            // Sort posts in reverse chronological order
            const sortedPosts = postsData.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            
            setPosts(sortedPosts);
            
            console.log("Fetched and sorted posts:", sortedPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
            console.error("Error response:", error.response);
            alert("Failed to fetch posts.");
        }
    };

    // Helper function to get initials and randomize color
    const getInitialsAndColor = (name) => {
        // Generate a consistent random color based on the name or a fallback
        const generateColor = (input) => {
            if (!input) {
                // If no input, use a truly random color
                return avatarColors[Math.floor(Math.random() * avatarColors.length)];
            }
            
            // Create a simple hash of the input string
            let hash = 0;
            for (let i = 0; i < input.length; i++) {
                hash = input.charCodeAt(i) + ((hash << 5) - hash);
            }
            
            // Use the hash to select a color from the palette
            const index = Math.abs(hash) % avatarColors.length;
            return avatarColors[index];
        };

        // Get initials
        const getInitials = () => {
            if (!name) return '?';
            const names = name.split(' ');
            return names.map(n => n[0].toUpperCase()).slice(0, 2).join('');
        };

        return {
            initials: getInitials(),
            color: generateColor(name)
        };
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Posts</h2>
                    <button 
                        onClick={() => navigate("/dashboard")} 
                        style={styles.backButton}
                    >
                        Back to Dashboard
                    </button>
                </div>

                {posts.length === 0 ? (
                    <div style={styles.noPostsMessage}>
                        No posts found or loading...
                    </div>
                ) : (
                    <div style={styles.gridContainer}>
                        {posts.map((post) => {
                            const { initials, color } = getInitialsAndColor(
                                post.user?.username || 
                                post.user?.email || 
                                'Unknown'
                            );

                            return (
                                <div 
                                    key={post.id} 
                                    style={{
                                        ...styles.postCard,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = styles.postCardHover.transform;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    {post.presigned_image_url && (
                                        <img 
                                            src={post.presigned_image_url} 
                                            alt={post.title} 
                                            style={styles.postImage}
                                        />
                                    )}
                                    
                                    <div style={styles.postContent}>
                                        {/* User Information */}
                                        <div style={styles.userInfo}>
                                            <div 
                                                style={{
                                                    ...styles.userAvatar, 
                                                    backgroundColor: color
                                                }}
                                            >
                                                {initials}
                                            </div>
                                            <div>
                                                <p style={{margin: 0, fontWeight: 'bold', fontSize: '14px'}}>
                                                    {post.user?.username || post.user?.email || 'Unknown User'}
                                                </p>
                                            </div>
                                        </div>

                                        <h3 style={styles.postTitle}>{post.title}</h3>
                                        <p style={styles.postMeta}>
                                            Created on: {new Date(post.created_at).toLocaleString()}
                                        </p>
                                        
                                        {post.content && (
                                            <p style={styles.postText}>{post.content}</p>
                                        )}
                                        
                                        {post.items && post.items.length > 0 && (
                                            <div>
                                                <h4 style={styles.associatedItemsTitle}>
                                                    Associated Items:
                                                </h4>
                                                {post.items.map((item) => (
                                                    <div 
                                                        key={item.precordsid} 
                                                        style={styles.associatedItem}
                                                    >
                                                        <span>{item.title}</span>
                                                        {item.presigned_image_url && (
                                                            <img 
                                                                src={item.presigned_image_url} 
                                                                alt={item.title} 
                                                                style={styles.associatedItemImage}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Posts;