import React, { useEffect, useState, useCallback } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, ArcElement, LineElement, CategoryScale, LinearScale, PointElement, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

ChartJS.register(Tooltip, Legend, ArcElement, LineElement, CategoryScale, LinearScale, PointElement, TimeScale);

function Dashboard() {
    const [devices, setDevices] = useState([]);
    const [userID, setUserID] = useState('');
    const [username, setUsername] = useState('');
    const [waterUsage, setWaterUsage] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [lineChartData, setLineChartData] = useState(null);
    const [disruptionMessages, setDisruptionMessages] = useState([]);
    const navigate = useNavigate();

    const fetchWaterUsage = useCallback(async (deviceIDs, devicesList) => {
        const query = deviceIDs.join(',');
        const response = await fetch(`https://arj74ctnbi.execute-api.us-east-2.amazonaws.com/dev/fetchWaterUsage?deviceID=${query}`);
        const waterUsageData = await response.json();
        setWaterUsage(waterUsageData);

        // Detect disruptions per device
        const currentTime = new Date();
        const disruptionMessages = devicesList.map(device => {
            const deviceData = waterUsageData.filter(usage => usage.DeviceID === device.DeviceID);
            if (deviceData.length > 0) {
                // Find the latest timestamp
                const latestTimestamp = new Date(
                    Math.max(...deviceData.map(usage => new Date(usage.Timestamp)))
                );
                const timeDifference = Math.abs(currentTime - latestTimestamp) / (1000 * 60); // Minutes
                if (timeDifference > 3.5) { // 3 minutes + grace period
                    return `Possible disruption for device "${device.DeviceName}" (Last sync: ${latestTimestamp.toLocaleString()})`;
                }
            }
            return null;
        }).filter(message => message); // Filter out nulls

        // Display disruption messages
        setDisruptionMessages(disruptionMessages);

        // Generate pie chart data
        const totalUsageByDevice = devicesList.map(device => {
            const filteredData = waterUsageData.filter(usage => usage.DeviceID === device.DeviceID);
            const totalUsage = filteredData.reduce((sum, usage) => sum + parseFloat(usage.WaterUsed || 0), 0);
            return { deviceName: device.DeviceName, totalUsage };
        });

        setChartData({
            labels: totalUsageByDevice.map(device => device.deviceName),
            datasets: [
                {
                    label: 'Total Water Usage',
                    data: totalUsageByDevice.map(device => device.totalUsage),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                    hoverOffset: 4,
                },
            ],
        });

        // Generate line chart data
        const uniqueDevices = [...new Set(waterUsageData.map(usage => usage.DeviceID))];
        const datasets = uniqueDevices.map((deviceID, index) => {
        const device = devicesList.find(device => device.DeviceID === deviceID);
        const deviceName = device ? device.DeviceName : deviceID;

        return {
            label: `Device Name: ${deviceName}`,
            data: waterUsageData
                .filter(usage => usage.DeviceID === deviceID)
                .map(usage => ({ x: usage.Timestamp, y: usage.WaterUsed })),
            borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index % 6],
            fill: false,
        };
    });

    setLineChartData({ datasets });
}, []);

    const fetchDevices = useCallback(async (userID) => {
        const response = await fetch(`https://arj74ctnbi.execute-api.us-east-2.amazonaws.com/dev/fetchUserDevices?userID=${userID}`);
        const devicesData = await response.json();
        setDevices(devicesData);

        const deviceIDs = devicesData.map(device => device.DeviceID);
        fetchWaterUsage(deviceIDs, devicesData);
    }, [fetchWaterUsage]);

    useEffect(() => {
        const storedUserID = localStorage.getItem('userID');
        const storedUsername = localStorage.getItem('username');

        setUserID(storedUserID);
        setUsername(storedUsername);
        fetchDevices(storedUserID);
    }, [fetchDevices]);

    const handleRefresh = () => {
        fetchDevices(userID);
    };

    const handleLogout = () => {
        localStorage.removeItem('userID');
        localStorage.removeItem('username');
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="user-info">
                    <p>Current user logged in: {username}</p>
                    <p>User ID: {userID}</p>
                </div>
                <h1 className="dashboard-title">Water Usage Dashboard</h1>
                <div className="action-buttons">
                    <button onClick={handleRefresh} className="refresh-button">Refresh</button>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </div>

            <div className="device-table-container">
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
            </div>

            <div className="disruption-messages">
                {disruptionMessages.length > 0 ? (
                    disruptionMessages.map((message, index) => (
                        <p key={index} className="disruption-alert">
                            {message}
                        </p>
                    ))
                ) : (
                    <p>No disruptions detected.</p>
                )}
            </div>

            <div className="chart-section">
                <div className="chart-container pie-chart">
                    {chartData ? (
                        <Pie
                            data={chartData}
                            options={{
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: (tooltipItem) => {
                                                const deviceUsage = waterUsage[tooltipItem.dataIndex];
                                                const totalWaterUsed = tooltipItem.raw;
                                                return `Device ID: ${deviceUsage.DeviceID}, Water Used: ${totalWaterUsed.toFixed(2)}`;
                                            },
                                        },
                                    },
                                },
                            }}
                        />
                    ) : (
                        <p>Loading chart data...</p>
                    )}
                </div>

                <div className="chart-container line-chart">
                    {lineChartData ? (
                        <Line
                            data={lineChartData}
                            options={{
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: (tooltipItem) => {
                                                const dataPoint = tooltipItem.raw; // The object containing x and y
                                                return `Water Used: ${dataPoint.y}`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    x: {
                                        type: 'time',
                                        time: { unit: 'hour' },
                                        title: { display: true, text: 'Time' },
                                    },
                                    y: {
                                        title: { display: true, text: 'Water Usage' },
                                    },
                                },
                            }}
                        />
                    ) : (
                        <p>Loading chart data...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
