import React, { useEffect, useState, useCallback } from 'react';

function Dashboard() {
    const [devices, setDevices] = useState([]);
    const [userID, setUserID] = useState('');
    const [waterUsage, setWaterUsage] = useState([]);

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
        console.log('Stored UserID in localStorage:', storedUserID);

        if (storedUserID) {
            setUserID(storedUserID);
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

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Current User: {userID ? userID : 'No user logged in'}</p>
            <button onClick={handleRefresh}>Refresh</button>

            {devices.length > 0 ? (
                <ul>
                    {devices.map(device => (
                        <li key={device.DeviceID}>
                            {device.DeviceName} - {device.DeviceID}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No devices registered yet.</p>
            )}

            {waterUsage.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Device ID</th>
                            <th>Water Used</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {waterUsage.map((usage, index) => (
                            <tr key={index}>
                                <td>{usage.DeviceID}</td>
                                <td>{usage.WaterUsed}</td>
                                <td>{usage.Timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No water usage data available.</p>
            )}
        </div>
    );
}

export default Dashboard;
