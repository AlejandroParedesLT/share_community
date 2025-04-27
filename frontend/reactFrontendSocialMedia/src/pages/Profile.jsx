import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function Profile() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const API_URL = "http://localhost:8001";
    const token = localStorage.getItem("accessToken");

    // Color palette for avatars
    const avatarColors = [
        '#0095f6', '#5B4FD8', '#E1306C', '#FF6B6B', '#4ECDC4',
        '#45B7D1', '#F9D56E', '#FF8C42', '#6A5ACD', '#2A9D8F',
    ];

    const styles = {
        pageContainer: {
            width: "100%",
            minHeight: "100vh",
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            backgroundColor: '#f0f2f5',
            overflowY: 'auto',
        },
        navBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#c4ede7',
            padding: '1rem 2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        navLogoContainer: {
            display: 'flex',
            alignItems: 'center',
        },
        navLogo: {
            width: '40px',
            height: '40px',
            marginRight: '10px',
        },
        navTitle: {
            fontSize: '1.75rem',
            fontFamily: '"Montserrat", "Segoe UI", sans-serif',
            fontWeight: '700',
            color: '#1a3c34',
            margin: 0,
            letterSpacing: '0.5px',
        },
        backButton: {
            backgroundColor: '#c4ede7',
            color: '#1a3c34',
            border: '1px solid #1a3c34',
            borderRadius: '0.375rem',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, transform 0.1s ease',
        },
        container: {
            maxWidth: '1200px',
            margin: '30px auto',
            padding: '0 20px',
            transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(20px)",
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#2D3748',
        },
        profileInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        avatar: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#0095f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '30px',
            fontWeight: 'bold',
        },
        profilePicture: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            objectFit: 'cover',
        },
        details: {
            fontSize: '16px',
            color: '#4B5563',
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
            color: '#2D3748',
        },
        postMeta: {
            fontSize: '14px',
            color: '#6B7280',
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
            color: '#4B5563',
            marginBottom: '15px',
        },
        noPostsMessage: {
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '18px',
            marginTop: '50px',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        associatedItemsTitle: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#2D3748',
        },
        associatedItemHover: {
            transform: 'scale(1.05)',
        },
        associatedItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'black',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '10px',
            transition: 'transform 0.3s ease',
            cursor: 'pointer',
        },
        associatedItemImage: {
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '8px',
        },
        recentPostsHeader: {
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#2D3748',
            marginBottom: '20px',
            borderBottom: '2px solid #ddd',
            paddingBottom: '10px',
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/");
        } else {
            fetchUserProfile();
            fetchUserPosts();
            // Set isLoaded to true after a short delay to trigger animations
            setTimeout(() => setIsLoaded(true), 100);
        }
    }, [token, navigate, id]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/user/?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data.data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            alert("Failed to load user profile.");
        }
    };

    const fetchUserPosts = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/posts?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const postsData = response.data.results || [];
    
            if (Array.isArray(postsData)) {
                const sortedPosts = postsData.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setPosts(sortedPosts);
            } else {
                console.error("Posts data is not an array:", postsData);
            }
        } catch (error) {
            console.error("Error fetching user posts:", error);
            alert("Failed to load user posts.");
        }
    };
    
    // Helper function to get initials and randomize color
    const getInitialsAndColor = (name) => {
        const generateColor = (input) => {
            let hash = 0;
            for (let i = 0; i < input.length; i++) {
                hash = input.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash) % avatarColors.length;
            return avatarColors[index];
        };

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
            {/* Navigation Bar */}
            <div style={styles.navBar}>
                <div style={styles.navLogoContainer}>
                    <img 
                        src="https://i.pinimg.com/736x/12/1e/3c/121e3c7353b6c0c7ed5b8913918bc8bc.jpg" 
                        alt="Pizza icon" 
                        style={styles.navLogo} 
                    />
                    <h1 style={styles.navTitle}>Slice of Life</h1>
                </div>
                <button 
                    style={styles.backButton}
                    onClick={() => navigate("/dashboard")}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#b0e0d6';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#c4ede7';
                    }}
                >
                    Back to Dashboard
                </button>
            </div>

            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Profile</h2>
                </div>

                {user ? (
                    <div style={styles.profileInfo}>
                        {user.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" style={styles.profilePicture} />
                        ) : (
                            <div style={styles.avatar}>
                                {user.username ? user.username[0].toUpperCase() : '?'}
                            </div>
                        )}
                        <div style={styles.details}>
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>About Me:</strong> {user.bio || 'No bio available'}</p>
                        </div>
                    </div>
                ) : (
                    <p>Loading profile...</p>
                )}

                {/* Recent Posts Header */}
                <div style={styles.recentPostsHeader}>
                    Recent Posts
                </div>

                {posts.length === 0 ? (
                    <div style={styles.noPostsMessage}>
                        No posts found or loading...
                    </div>
                ) : (
                    <div style={styles.gridContainer}>
                        {posts.map((post) => {
                            const { initials, color } = getInitialsAndColor(post.user?.username || 'Unknown');

                            return (
                                <div 
                                    key={post.id} 
                                    style={styles.postCard}
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
                                                    {post.user?.username || 'Unknown User'}
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
                                                        onClick={() => navigate(`/view-item/${item.precordsid}`)}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = styles.associatedItemHover.transform;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
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

export default Profile;