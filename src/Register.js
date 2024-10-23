// src/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const response = await fetch('https://arj74ctnbi.execute-api.us-east-2.amazonaws.com/dev/registerUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                Username: username,  // Ensure capitalization of 'Username'
                Password: password,  // Ensure capitalization of 'Password'
                Email: email         // Optional, no change needed here
            }),
        });
        if (response.status === 200) {
            alert('User registered successfully!');
            navigate('/login');
        } else {
            const data = await response.json();
            alert('Registration failed: ' + data.message);
        }
    };

    return (
        <div>
            <h1>Create Profile</h1>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;
