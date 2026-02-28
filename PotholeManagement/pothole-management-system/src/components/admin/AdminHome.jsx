// AdminHome.js
import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import Dashboard from './Dashboard';
import Users from './Users';
import ApiService from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';

// ---- Notifications Panel ----
function NotificationsPanel() {
    const [potholes, setPotholes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await ApiService.getPotholesData();
                // Show most recent reports as notifications
                const sorted = (data || []).sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate));
                setPotholes(sorted.slice(0, 20));
            } catch (err) {
                console.error('Error fetching notifications:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'REPORTED': return 'bg-red-100 text-red-700';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-700';
            case 'FIXED': return 'bg-green-100 text-green-700';
            case 'IGNORED': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'HIGH': return '🔴';
            case 'MODERATE': return '🟡';
            case 'LOW': return '🟢';
            default: return '⚪';
        }
    };

    if (loading) return <div className="text-gray-500 text-center py-8">Loading notifications...</div>;

    return (
        <div className="space-y-3">
            {potholes.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-5xl mb-3">🔔</div>
                    <p className="text-gray-500 text-lg">No notifications yet</p>
                    <p className="text-gray-400 text-sm mt-1">Pothole reports will appear here as they are submitted.</p>
                </div>
            ) : (
                potholes.map((pothole, index) => (
                    <div key={pothole.potholeId || index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        {/* Image thumbnail */}
                        {pothole.potholeImage ? (
                            <img src={ApiService.getImageUrl(pothole.potholeImage)} alt="Pothole" className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                        ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl">{getSeverityIcon(pothole.severity)}</div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-gray-800 text-sm">
                                    Pothole Report #{pothole.potholeId}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(pothole.status)}`}>
                                    {pothole.status}
                                </span>
                                <span className="text-xs text-gray-400 ml-auto">
                                    Severity: {pothole.severity}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                📍 {pothole.latitude?.toFixed(4)}, {pothole.longitude?.toFixed(4)}
                            </p>
                            {pothole.reportedDate && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    🕐 {new Date(pothole.reportedDate).toLocaleString()}
                                </p>
                            )}
                            {pothole.potholeCount > 0 && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    ML detected: {pothole.potholeCount} pothole(s) in image
                                </p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// ---- Pothole Analytics Panel ----
function AnalyticsPanel() {
    const [potholes, setPotholes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await ApiService.getPotholesData();
                setPotholes(data || []);
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div className="text-gray-500 text-center py-8">Loading analytics...</div>;

    const total = potholes.length;
    const reported = potholes.filter(p => p.status === 'REPORTED').length;
    const underReview = potholes.filter(p => p.status === 'UNDER_REVIEW').length;
    const fixed = potholes.filter(p => p.status === 'FIXED').length;
    const ignored = potholes.filter(p => p.status === 'IGNORED').length;
    const high = potholes.filter(p => p.severity === 'HIGH').length;
    const moderate = potholes.filter(p => p.severity === 'MODERATE').length;
    const low = potholes.filter(p => p.severity === 'LOW').length;

    const StatCard = ({ icon, label, value, color }) => (
        <div className={`${color} rounded-xl p-4 shadow-sm`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-600 mt-1">{label}</div>
        </div>
    );

    const BarItem = ({ label, value, total: t, color }) => (
        <div className="flex items-center gap-3 py-1">
            <span className="text-sm text-gray-600 w-24">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: t > 0 ? `${(value / t) * 100}%` : '0%' }}></div>
            </div>
            <span className="text-sm font-semibold text-gray-700 w-8 text-right">{value}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon="📊" label="Total Reports" value={total} color="bg-blue-50" />
                <StatCard icon="🚨" label="Reported" value={reported} color="bg-red-50" />
                <StatCard icon="�" label="Under Review" value={underReview} color="bg-yellow-50" />
                <StatCard icon="✅" label="Fixed" value={fixed} color="bg-green-50" />
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Status Breakdown</h3>
                <BarItem label="Reported" value={reported} total={total} color="bg-red-400" />
                <BarItem label="Under Review" value={underReview} total={total} color="bg-yellow-400" />
                <BarItem label="Fixed" value={fixed} total={total} color="bg-green-400" />
                <BarItem label="Ignored" value={ignored} total={total} color="bg-gray-400" />
            </div>

            {/* Severity Breakdown */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Severity Distribution</h3>
                <BarItem label="🔴 High" value={high} total={total} color="bg-red-500" />
                <BarItem label="🟡 Moderate" value={moderate} total={total} color="bg-yellow-500" />
                <BarItem label="🟢 Low" value={low} total={total} color="bg-emerald-500" />
            </div>
        </div>
    );
}

// ---- Settings Panel ----
function SettingsPanel() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>⚙️</span> System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Application</span>
                        <span className="font-medium text-gray-800">RoadGuard v1.0</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Backend</span>
                        <span className="font-medium text-gray-800">Spring Boot 3.3.2</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">ML Model</span>
                        <span className="font-medium text-gray-800">YOLOv8 (Flask API)</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Database</span>
                        <span className="font-medium text-gray-800">MySQL 8.0</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Frontend</span>
                        <span className="font-medium text-gray-800">React 18 + Vite</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Region</span>
                        <span className="font-medium text-gray-800">Coimbatore, TN</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>👥</span> Admin Account
                </h3>
                <div className="text-sm space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Email</span>
                        <span className="font-medium text-gray-800">admin@roadguard.com</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Role</span>
                        <span className="font-medium text-emerald-700">ADMIN</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminHome() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeContent, setActiveContent] = useState('dashboard');
    const navigate = useNavigate();

    // Function to toggle the sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Function to handle sidebar button clicks
    const handleSidebarClick = (content) => {
        if (content === 'logout') {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
            window.location.reload();
            return;
        }
        setActiveContent(content);
        setIsSidebarOpen(false);
    };

    const sidebarItems = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'users', label: 'Users', icon: '👥' },
        { key: 'analytics', label: 'Analytics', icon: '📈' },
        { key: 'notifications', label: 'Notifications', icon: '🔔' },
        { key: 'settings', label: 'Settings', icon: '⚙️' },
        { key: 'logout', label: 'Logout', icon: '🚪' },
    ];

    const getTitle = () => {
        const item = sidebarItems.find(i => i.key === activeContent);
        return item ? `${item.icon} ${item.label}` : '';
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Navbar */}
            <AdminNavbar toggleSidebar={toggleSidebar} />

            {/* Sidebar */}
            <aside
                id="logo-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 sm:translate-x-0`}
                aria-label="Sidebar"
            >
                <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
                    <ul className="space-y-1 font-medium">
                        {sidebarItems.map(item => (
                            <li key={item.key}>
                                <button
                                    onClick={() => handleSidebarClick(item.key)}
                                    className={`flex items-center p-2.5 rounded-lg group w-full text-left transition-colors duration-150 ${
                                        activeContent === item.key
                                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                            : item.key === 'logout'
                                            ? 'text-red-600 hover:bg-red-50'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="text-lg mr-3">{item.icon}</span>
                                    <span className="flex-1 whitespace-nowrap">{item.label}</span>
                                    {item.key === 'notifications' && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-emerald-500 rounded-full">
                                            !
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Main content */}
            <main className={`flex-1 p-4 sm:ml-64 transition-all ${isSidebarOpen ? 'ml-64' : ''} bg-gray-50`}>
                <h1 className="text-xl font-bold text-gray-800 mb-4">{getTitle()}</h1>
                <div className="mt-2">
                    {activeContent === 'dashboard' && <Dashboard />}
                    {activeContent === 'users' && <Users />}
                    {activeContent === 'analytics' && <AnalyticsPanel />}
                    {activeContent === 'notifications' && <NotificationsPanel />}
                    {activeContent === 'settings' && <SettingsPanel />}
                </div>
            </main>
        </div>
    );
}
