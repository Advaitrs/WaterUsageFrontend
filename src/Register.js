import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import Framer Motion
import './Register.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); // State for the registration message
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear any existing message before registration attempt

        try {
            const response = await fetch('https://arj74ctnbi.execute-api.us-east-2.amazonaws.com/dev/registerUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    Username: username, 
                    Password: password, 
                    Email: email 
                }),
            });
            
            if (response.status === 200) {
                setMessage('User registered successfully!');
                setTimeout(() => navigate('/'), 2000); // Redirect to login after 2 seconds
            } else {
                const data = await response.json();
                setMessage('Registration failed: ' + data.message); // Display error message
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setMessage('An error occurred during registration');
        }
    };

    const goToLogin = () => {
        navigate('/');
    };

    return (
        <div className="register-container">
            <h1>Create Profile</h1>
            <form onSubmit={handleRegister}>
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
                <input 
                    type="email" 
                    placeholder="Email (optional)" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="register-button"
                >
                    Register
                </motion.button>
            </form>
            
            <motion.button
                onClick={goToLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="back-button"
            >
                Back to Login
            </motion.button>

            {/* Display registration message below the buttons */}
            {message && <p className="register-message">{message}</p>}
        </div>
    );
}

export default Register;
