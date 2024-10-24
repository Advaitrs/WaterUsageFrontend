import React, { useEffect, useState, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from 'chart.js';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Dashboard.css'; // Add this for custom styles

// Register necessary components in Chart.js
ChartJS.register(Tooltip, Legend, ArcElement);

function Dashboard() {
    const [devices, setDevices] = useState([]);
    const [userID, setUserID] = useState('');
    const [username, setUsername] = useState('');  // New state for username
    const [waterUsage, setWaterUsage] = useState([]);
    const [chartData, setChartData] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate for routing

    // Fetch water usage for multiple devices
    const fetchWaterUsage = useCallback(async (deviceIDs) => {
        console.log('Fetching water usage for deviceIDs:', deviceIDs);

        const query = deviceIDs.join(',');
        const response = await fetch(`https://arj74ctnbi.execute-api.us-east-2.amazonaws.com/dev/fetchWaterUsage?deviceID=${query}`);

        if (!response.ok) {
            throw new Error('Failed to load water usage');
        }

        const waterUsageData = await response.json();
        setWaterUsage(waterUsageData);  // Update the water usage state with data for all devices

        // Create chart data based on water usage
        const labels = waterUsageData.map((usage) => `Device ID: ${usage.DeviceID}`);
        const dataValues = waterUsageData.map((usage) => usage.WaterUsed);

        const chartData = {
            labels,
            datasets: [
                {
                    label: 'Water Usage',
                    data: dataValues,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                    ],
                    hoverOffset: 4
                }
            ]
        };

        setChartData(chartData);
    }, []);

    // Fetch devices for the current user
    const fetchDevices = useCallback(async (userID) => {
        console.log('Fetching devices for userID:', userID);

        try {
            const response = await fetch(`https://arj74ctnbi.execute-api.us-east-2.amazonaws.com/dev/fetchUserDevices?userID=${userID}`);

            if (!response.ok) {
                throw new Error('Failed to load user devices');
            }

            const devicesData = await response.json();

            if (devicesData && Array.isArray(devicesData)) {
                setDevices(devicesData);
                const deviceIDs = devicesData.map(device => device.DeviceID);
                fetchWaterUsage(deviceIDs);  // Fetch water usage for all devices
            } else {
                console.error('Expected an array of devices, but got:', devicesData);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    }, [fetchWaterUsage]);  // Now `fetchWaterUsage` is included in the dependency array

    useEffect(() => {
        const storedUserID = localStorage.getItem('userID');
        const storedUsername = localStorage.getItem('username'); // Fetch stored username

        console.log('Stored UserID in localStorage:', storedUserID);
        console.log('Stored Username in localStorage:', storedUsername);

        if (storedUserID) {
            setUserID(storedUserID);
            setUsername(storedUsername);  // Set the username state
            fetchDevices(storedUserID);  // Initial fetch
        } else {
            console.error('No userID found in local storage');
        }
    }, [fetchDevices]);  // `fetchDevices` added to dependency array

    // Handle refreshing device and water usage data
    const handleRefresh = () => {
        console.log('Refresh button clicked');

        if (userID) {
            fetchDevices(userID);  // Refresh the devices and water usage data
        } else {
            console.error('No userID available to refresh data');
        }
    };

    // Handle logout button click
    const handleLogout = () => {
        localStorage.removeItem('userID');  // Remove userID from localStorage
        localStorage.removeItem('username');  // Remove username from localStorage
        navigate('/');  // Redirect back to the login page
    };

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <p>Username: {username ? username : 'No username available'}</p> {/* Display Username */}
            <p>Current User: {userID ? userID : 'No user logged in'}</p> {/* Display UserID */}
            <div className="button-group">
                <button onClick={handleRefresh} className="refresh-button">Refresh</button>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>

            {devices.length > 0 ? (
                <table className="device-table">
                    <thead>
                        <tr>
                            <th>Device Name</th>
                            <th>Device ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map(device => (
                            <tr key={device.DeviceID}>
                                <td>{device.DeviceName}</td>
                                <td>{device.DeviceID}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No devices registered yet.</p>
            )}

            {waterUsage.length > 0 && chartData ? (
                <div className="chart-container">
                    <Pie 
                        data={chartData} 
                        options={{
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: (tooltipItem) => {
                                            const deviceUsage = waterUsage[tooltipItem.dataIndex];
                                            return `Device ID: ${deviceUsage.DeviceID}, Water Used: ${deviceUsage.WaterUsed}, Timestamp: ${deviceUsage.Timestamp}`;
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </div>
            ) : (
                <p>No water usage data available.</p>
            )}
        </div>
    );
}

export default Dashboard;
