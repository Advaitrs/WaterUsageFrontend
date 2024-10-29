import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // State for the login status message
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear any existing message before login attempt

        try {
            const requestBody = JSON.stringify({
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const response = await fetch('https://arj74ctnbi.execute-api.us-east-2.amazonaws.com/dev/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: requestBody
            });

            const rawData = await response.json();
            let data;
            if (rawData.body) {
                data = JSON.parse(rawData.body);
            } else {
                data = rawData;
            }

            if (response.status === 200 && data.message === 'Login successful!') {
                setMessage('Login successful!');
                localStorage.setItem('userID', data.UserID);
                localStorage.setItem('username', username);
                navigate('/dashboard');
            } else {
                setMessage('Login failed: ' + data.error); // Set error message
            }
        } catch (error) {
            console.error('Error during login:', error);
            setMessage('An error occurred during login'); // Set error message
        }
    };

    const goToRegister = () => {
        navigate('/register');
    };

    return (
        <div className="login-container">
            <h1>Dashboard Login</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="login-button"
                >
                    Login
                </motion.button>
            </form>

            <motion.button
                onClick={goToRegister}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="secondary-button"
            >
                Create Profile
            </motion.button>

            {/* Display login message below the buttons */}
            {message && <p className="login-message">{message}</p>}
        </div>
    );
}

export default Login;
