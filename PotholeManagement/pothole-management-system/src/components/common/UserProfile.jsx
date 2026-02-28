import React, { useEffect, useState } from 'react';
import ApiService from '../../services/ApiService';
import Footer from '../Home/Footer';
import { FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaChartBar, FaExclamationCircle, FaCheckCircle, FaClock, FaBan } from 'react-icons/fa';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch profile
                const profileRes = await ApiService.getUserProfile();
                if (profileRes.statusCode === 200 && profileRes.user) {
                    setUser(profileRes.user);
                } else {
                    setError(profileRes.message || 'Failed to load profile.');
                    setLoading(false);
                    return;
                }

                // Fetch user's reports for stats
                const userId = localStorage.getItem('userId');
                if (userId) {
                    const reportData = await ApiService.getMyReports(userId);
                    setReports(reportData);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
                setError('Failed to load profile. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = {
        total: reports.length,
        reported: reports.filter(r => r.status === 'REPORTED').length,
        underReview: reports.filter(r => r.status === 'UNDER_REVIEW').length,
        fixed: reports.filter(r => r.status === 'FIXED').length,
        ignored: reports.filter(r => r.status === 'IGNORED').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto px-4 py-20">
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center">
                        {error}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-10 text-center">
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-4xl font-bold text-white border-4 border-white/30">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                        <p className="text-emerald-100 mt-1">{user?.role === 'ADMIN' ? 'Administrator' : 'Registered User'}</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <FaEnvelope className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                                    <p className="text-gray-800 font-medium text-sm">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FaPhone className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                                    <p className="text-gray-800 font-medium text-sm">{user?.phoneNumber || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FaShieldAlt className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Role</p>
                                    <p className="text-gray-800 font-medium text-sm">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Statistics */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <FaChartBar className="text-emerald-600 text-xl" />
                        <h2 className="text-xl font-bold text-gray-800">Report Statistics</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border">
                            <FaExclamationCircle className="text-gray-400 text-2xl mx-auto mb-2" />
                            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                            <p className="text-sm text-gray-500 mt-1">Total Reports</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center border border-blue-200">
                            <FaClock className="text-blue-500 text-2xl mx-auto mb-2" />
                            <p className="text-3xl font-bold text-blue-700">{stats.reported}</p>
                            <p className="text-sm text-blue-600 mt-1">Reported</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 text-center border border-yellow-200">
                            <FaClock className="text-yellow-500 text-2xl mx-auto mb-2" />
                            <p className="text-3xl font-bold text-yellow-700">{stats.underReview}</p>
                            <p className="text-sm text-yellow-600 mt-1">Under Review</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 text-center border border-emerald-200">
                            <FaCheckCircle className="text-emerald-500 text-2xl mx-auto mb-2" />
                            <p className="text-3xl font-bold text-emerald-700">{stats.fixed}</p>
                            <p className="text-sm text-emerald-600 mt-1">Fixed</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border">
                            <FaBan className="text-gray-400 text-2xl mx-auto mb-2" />
                            <p className="text-3xl font-bold text-gray-500">{stats.ignored}</p>
                            <p className="text-sm text-gray-500 mt-1">Ignored</p>
                        </div>
                    </div>

                    {stats.total > 0 && (
                        <div className="mt-6 text-center">
                            <a href="/my-reports" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm hover:underline">
                                View All Reports →
                            </a>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="/report-pothole" className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">+</div>
                            <div>
                                <p className="font-medium text-gray-800">Report Pothole</p>
                                <p className="text-xs text-gray-500">Submit a new report</p>
                            </div>
                        </a>
                        <a href="/my-reports" className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                <FaChartBar />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">My Reports</p>
                                <p className="text-xs text-gray-500">Track your submissions</p>
                            </div>
                        </a>
                        <a href="/map/search" className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors border border-teal-200">
                            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white">
                                <FaUser />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">View Map</p>
                                <p className="text-xs text-gray-500">Explore reported potholes</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
