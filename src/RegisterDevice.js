import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterDevice() {
    const [deviceName, setDeviceName] = useState('');
    const [innerDiameter, setInnerDiameter] = useState('');
    const [outerDiameter, setOuterDiameter] = useState('');
    // const [isConnectedToESP, setIsConnectedToESP] = useState(false);  // To handle connection state
    const navigate = useNavigate();

    const handleRegisterDevice = async (e) => {
        e.preventDefault();

        // User ID from local storage, or any other method you use
        const userID = localStorage.getItem('userID');
        const data = { userID, deviceName, innerDiameter, outerDiameter };

        try {
            // Assuming the ESP32 is hosting the form at its local AP IP (192.168.4.1)
            const response = await fetch('http://192.168.4.1/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.status === 200) {
                alert('Device registered successfully!');
                navigate('/dashboard');  // Redirect to the dashboard after successful registration
            } else {
                alert('Failed to register device.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Failed to connect to the device. Make sure you are connected to the ESP32’s Wi-Fi.');
        }
    };

    return (
        <div>
            <h1>Register Device</h1>
            
            {/* Instruct user to connect to ESP32's AP if not already connected */}
            {/* {!isConnectedToESP && (
                <p>
                    Please connect to the ESP32's Wi-Fi (WaterMonitor-Setup) and then fill in the form below to register the device.
                </p>
            )} */}
            
            {/* Device registration form */}
            <form onSubmit={handleRegisterDevice}>
                <input
                    type="text"
                    placeholder="Device Name"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Inner Pipe Diameter"
                    value={innerDiameter}
                    onChange={(e) => setInnerDiameter(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Outer Pipe Diameter"
                    value={outerDiameter}
                    onChange={(e) => setOuterDiameter(e.target.value)}
                    required
                />
                <button type="submit">Register Device</button>
            </form>
        </div>
    );
}

export default RegisterDevice;
