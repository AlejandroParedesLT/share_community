import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    country: "",  // Make it optional with an empty string
  });

  const [countries, setCountries] = useState([]); // Store country list
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/countries/");
        const data = await response.json();
        setCountries(data.countries); // Assuming the API returns { "countries": ["USA", "Canada"] }
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Create a copy of formData and remove country if it's empty
    const submissionData = { ...formData };
    if (!submissionData.country) {
      delete submissionData.country;
    }
    
    console.log("Submitting data:", submissionData);

    try {
        const response = await fetch("http://localhost:8001/api/user/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(submissionData),  // Use submissionData here
        });

        const data = await response.json();

        if (response.ok) {
            // Manually log in after signup
            const loginResponse = await fetch("http://localhost:8001/api/login/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    username: formData.username,
                    password: formData.password,
                }),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                localStorage.setItem("accessToken", loginData.access);
                localStorage.setItem("refresh_token", loginData.refresh);
                localStorage.setItem("username", formData.username);

                navigate("/preferences");
            } else {
                setError("Signup successful, but auto-login failed. Please log in manually.");
            }
        } else {
            setError(data.message || "Signup failed");
        }
    } catch (err) {
        setError("Something went wrong. Please try again.");
    }
};

return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="text" name="bio" placeholder="Bio (optional)" onChange={handleChange} />

        {/* Country dropdown */}
        <select name="country" value={formData.country} onChange={handleChange}>
          <option value="">Select a country (optional)</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Signup;
