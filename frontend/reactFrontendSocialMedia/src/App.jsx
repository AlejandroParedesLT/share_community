import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


// const API_URL = "http://127.0.0.1:8001";  // Adjust if Django runs elsewhere


// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import PrivateRoute from "./routes/PrivateRoute";

// function App() {
//   return (

//     <AuthProvider>
//       <Router>
//         <Routes>
//           <Route path="/login" element={<Login />} />
          
          

//           <Route
//             path="/dashboard"
//             element={
//               <PrivateRoute>
//                 <Dashboard />
//               </PrivateRoute>
//             }
//           />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;



function App() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const API_URL = "http://127.0.0.1:8001";  // Adjust if Django runs elsewhere

  // Handle input change
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Login and get JWT token
  const login = async () => {
    try {
      const response = await axios.post(`${API_URL}/login/`, credentials);
      setToken(response.data.access);
      localStorage.setItem("accessToken", response.data.access); // Store token
      alert("Login successful!");
    } catch (error) {
      alert("Login failed!");
    }
  };

  // Fetch protected data
  const getProtectedData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/login/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
    } catch (error) {
      alert("Access denied!");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>React-Django JWT Auth</h2>
      
      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <button onClick={login}>Login</button>

      <hr />
      <button onClick={getProtectedData} disabled={!token}>
        Get Protected Data
      </button>
      
      {message && <p>Server Response: {message}</p>}
    </div>
  );
}

export default App;