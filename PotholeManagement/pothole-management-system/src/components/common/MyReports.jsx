import React, { useEffect, useState } from 'react';
import ApiService from '../../services/ApiService';
import Footer from '../Home/Footer';
import { FaTimes, FaMapMarkerAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const STATUS_STEPS = ['REPORTED', 'UNDER_REVIEW', 'FIXED'];

function getStatusColor(status) {
    switch (status) {
        case 'REPORTED': return 'bg-blue-500';
        case 'UNDER_REVIEW': return 'bg-yellow-500';
        case 'FIXED': return 'bg-emerald-500';
        case 'IGNORED': return 'bg-gray-400';
        default: return 'bg-gray-300';
    }
}

function getStatusLabel(status) {
    switch (status) {
        case 'REPORTED': return 'Reported';
        case 'UNDER_REVIEW': return 'Under Review';
        case 'FIXED': return 'Fixed';
        case 'IGNORED': return 'Ignored';
        default: return status;
    }
}

function getSeverityBadge(severity) {
    switch (severity) {
        case 'HIGH': return 'bg-red-100 text-red-700 border-red-300';
        case 'MODERATE': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        case 'LOW': return 'bg-green-100 text-green-700 border-green-300';
        default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
}

export default function MyReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    setError('Please log in to view your reports.');
                    setLoading(false);
                    return;
                }
                const data = await ApiService.getMyReports(userId);
                setReports(data);
            } catch (err) {
                console.error('Error fetching reports:', err);
                setError('Failed to load your reports. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = filter === 'ALL' ? reports : reports.filter(r => r.status === filter);

    const stats = {
        total: reports.length,
        reported: reports.filter(r => r.status === 'REPORTED').length,
        underReview: reports.filter(r => r.status === 'UNDER_REVIEW').length,
        fixed: reports.filter(r => r.status === 'FIXED').length,
        ignored: reports.filter(r => r.status === 'IGNORED').length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Reports</h1>
                <p className="text-gray-500 mb-6">Track the status of potholes you've reported</p>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('ALL')}>
                        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        <p className={`text-sm ${filter === 'ALL' ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>Total</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('REPORTED')}>
                        <p className="text-2xl font-bold text-blue-600">{stats.reported}</p>
                        <p className={`text-sm ${filter === 'REPORTED' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Reported</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('UNDER_REVIEW')}>
                        <p className="text-2xl font-bold text-yellow-600">{stats.underReview}</p>
                        <p className={`text-sm ${filter === 'UNDER_REVIEW' ? 'text-yellow-600 font-semibold' : 'text-gray-500'}`}>Under Review</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('FIXED')}>
                        <p className="text-2xl font-bold text-emerald-600">{stats.fixed}</p>
                        <p className={`text-sm ${filter === 'FIXED' ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>Fixed</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('IGNORED')}>
                        <p className="text-2xl font-bold text-gray-500">{stats.ignored}</p>
                        <p className={`text-sm ${filter === 'IGNORED' ? 'text-gray-700 font-semibold' : 'text-gray-500'}`}>Ignored</p>
                    </div>
                </div>

                {/* Loading / Error States */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">
                        {error}
                    </div>
                )}

                {/* Reports List */}
                {!loading && !error && filteredReports.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <FaExclamationTriangle className="text-gray-300 text-5xl mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {filter === 'ALL' ? "You haven't reported any potholes yet." : `No reports with status "${getStatusLabel(filter)}".`}
                        </p>
                        {filter === 'ALL' && (
                            <a href="/report-pothole" className="inline-block mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                                Report a Pothole
                            </a>
                        )}
                    </div>
                )}

                <div className="space-y-6">
                    {filteredReports.map((report) => {
                        const isIgnored = report.status === 'IGNORED';
                        const currentStepIndex = STATUS_STEPS.indexOf(report.status);

                        return (
                            <div key={report.potholeId} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Image */}
                                    <div className="md:w-48 w-full h-48 md:h-auto flex-shrink-0">
                                        {report.potholeImage ? (
                                            <img
                                                src={ApiService.getImageUrl(report.potholeImage)}
                                                alt="Pothole"
                                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => setPreviewImage(ApiService.getImageUrl(report.potholeImage))}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">Report #{report.potholeId}</h3>
                                                <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                                    <FaMapMarkerAlt className="text-red-400" />
                                                    <span>{Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityBadge(report.severity)}`}>
                                                    {report.severity}
                                                </span>
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(report.status)}`}>
                                                    {getStatusLabel(report.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5">
                                            <div className="flex items-center gap-1">
                                                <FaClock className="text-gray-400" />
                                                <span>Reported: {new Date(report.reportedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            {report.updatedDate && (
                                                <div className="flex items-center gap-1">
                                                    <FaClock className="text-emerald-400" />
                                                    <span>Updated: {new Date(report.updatedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Timeline */}
                                        {!isIgnored ? (
                                            <div className="flex items-center gap-0">
                                                {STATUS_STEPS.map((step, idx) => {
                                                    const isActive = idx <= currentStepIndex;
                                                    const isLast = idx === STATUS_STEPS.length - 1;
                                                    return (
                                                        <React.Fragment key={step}>
                                                            <div className="flex flex-col items-center">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isActive ? `${getStatusColor(step)} text-white border-transparent` : 'bg-gray-100 text-gray-400 border-gray-300'}`}>
                                                                    {idx + 1}
                                                                </div>
                                                                <span className={`text-xs mt-1 whitespace-nowrap ${isActive ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                                                    {getStatusLabel(step)}
                                                                </span>
                                                            </div>
                                                            {!isLast && (
                                                                <div className={`flex-1 h-1 min-w-[40px] mx-1 rounded-full ${idx < currentStepIndex ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-500 bg-gray-50 rounded-lg p-3">
                                                <span className="text-sm">This report has been marked as <strong>Ignored</strong> by the admin.</span>
                                            </div>
                                        )}

                                        {/* Pothole Count */}
                                        {report.potholeCount > 0 && (
                                            <p className="text-xs text-gray-400 mt-3">Potholes detected: {report.potholeCount}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-3xl max-h-[85vh] p-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 bg-white text-gray-700 rounded-full p-2 shadow-lg hover:bg-red-500 hover:text-white transition-colors z-10">
                            <FaTimes />
                        </button>
                        <img src={previewImage} alt="Pothole Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
