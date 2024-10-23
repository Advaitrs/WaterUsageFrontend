import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
    
        try {
            // Prepare the request body (double JSON encoding as required)
            const requestBody = JSON.stringify({
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
    
            // Make the login API request
            const response = await fetch('https://arj74ctnbi.execute-api.us-east-2.amazonaws.com/dev/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: requestBody  // Double body encoded as required
            });
    
            // Parse the response
            const rawData = await response.json(); // Parse the raw response
            let data;
            if (rawData.body) {
                data = JSON.parse(rawData.body); // Further parse if nested in the 'body' field
            } else {
                data = rawData;
            }
    
            // Check the statusCode returned by the API
            if (response.status === 200 && data.message === 'Login successful!') {
                alert('Login successful!');
                // Store the userID in localStorage
                localStorage.setItem('userID', data.UserID);
                // Redirect to the dashboard
                navigate('/dashboard');
            } else {
                alert('Login failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login');
        }
    };
    

    const goToRegister = () => {
        navigate('/register');
    };

    return (
        <div>
            <h1>Login</h1>
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
                <button type="submit">Login</button>
            </form>

            <button onClick={goToRegister} style={{ marginTop: '20px' }}>
                Create Profile
            </button>
        </div>
    );
}

export default Login;
