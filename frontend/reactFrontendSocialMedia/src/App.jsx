import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import './App.css'
import Dashboard from './pages/Dashboard'

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
      </Router>
  );
}

export default App;

