import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const handleNavigateToItems = () => {
        navigate("/items"); // Navigate to Items page
    };

    const handleNavigateToPostItem = () => {
        navigate("/post-item"); // Navigate to PostItem form
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Dashboard</h2>
            <div>
                <button
                    onClick={handleNavigateToItems}
                    style={{ marginRight: "20px", padding: "10px 15px", cursor: "pointer" }}
                >
                    Go to Items
                </button>
                <button
                    onClick={handleNavigateToPostItem}
                    style={{ padding: "10px 15px", cursor: "pointer" }}
                >
                    Post New Item
                </button>
            </div>
        </div>
    );
}

export default Dashboard;

