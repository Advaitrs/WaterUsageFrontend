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
    const navigate = useNavigate();

    const fetchWaterUsage = useCallback(async (deviceIDs) => {
        const query = deviceIDs.join(',');
        const response = await fetch(`https://arj74ctnbi.execute-api.us-east-2.amazonaws.com/dev/fetchWaterUsage?deviceID=${query}`);
        const waterUsageData = await response.json();
        setWaterUsage(waterUsageData);

        // Generate data for the pie chart
        setChartData({
            labels: waterUsageData.map((usage) => `Device ID: ${usage.DeviceID}`),
            datasets: [
                {
                    label: 'Water Usage',
                    data: waterUsageData.map((usage) => usage.WaterUsed),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                    hoverOffset: 4
                }
            ]
        });

        // Generate data for the line chart, with each device in a unique color
        const uniqueDevices = [...new Set(waterUsageData.map(usage => usage.DeviceID))];
        const datasets = uniqueDevices.map((deviceID, index) => ({
            label: `Device ID: ${deviceID}`,
            data: waterUsageData.filter(usage => usage.DeviceID === deviceID).map(usage => usage.WaterUsed),
            borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index % 6],
            fill: false,
        }));

        setLineChartData({
            labels: waterUsageData.map((usage) => usage.Timestamp),
            datasets: datasets
        });
    }, []);

    const fetchDevices = useCallback(async (userID) => {
        const response = await fetch(`https://arj74ctnbi.execute-api.us-east-2.amazonaws.com/dev/fetchUserDevices?userID=${userID}`);
        const devicesData = await response.json();
        setDevices(devicesData);
        fetchWaterUsage(devicesData.map(device => device.DeviceID));
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

            <div className="chart-section">
                <div className="chart-container pie-chart">
                    {chartData ? (
                        <Pie data={chartData} options={{
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
                        }} />
                    ) : (
                        <p>Loading chart data...</p>
                    )}
                </div>

                <div className="chart-container line-chart">
                    {lineChartData ? (
                        <Line data={lineChartData} options={{
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: (tooltipItem) => `Water Used: ${tooltipItem.raw}`
                                    }
                                }
                            },
                            scales: {
                                x: {
                                    type: 'time',
                                    time: { unit: 'hour' },
                                    title: { display: true, text: 'Time' }
                                },
                                y: {
                                    title: { display: true, text: 'Water Usage' }
                                }
                            }
                        }} />
                    ) : (
                        <p>Loading chart data...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
