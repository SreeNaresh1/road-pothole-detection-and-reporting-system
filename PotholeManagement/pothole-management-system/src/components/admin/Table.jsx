// PotholeList.js
import React, { useEffect, useState } from 'react';
import ApiService from '../../services/ApiService';
import Dialog from './Dialog';
import { FaEye, FaDownload, FaTimes } from 'react-icons/fa';

export default function PotholeList() {
    const [potholes, setPotholes] = useState([]);
    const [selectedPothole, setSelectedPothole] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [severityFilter, setSeverityFilter] = useState('ALL');
    const pageSize = 10;

    useEffect(() => {
        const fetchPotholes = async () => {
            setLoading(true);
            try {
                const data = await ApiService.getPotholesData();
                console.log(data);
                setPotholes(data);
            } catch (error) {
                console.error('Error fetching potholes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPotholes();
    }, []);

    if (loading) return <div>Loading...</div>;

    // Apply filters
    const filteredPotholes = potholes.filter(p => {
        const matchesSearch = searchTerm === '' ||
            String(p.potholeId).includes(searchTerm) ||
            p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        const matchesSeverity = severityFilter === 'ALL' || p.severity === severityFilter;
        return matchesSearch && matchesStatus && matchesSeverity;
    });

    const totalPages = Math.ceil(filteredPotholes.length / pageSize);
    const currentPotholes = filteredPotholes.slice().reverse().slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Latitude', 'Longitude', 'Severity', 'Status', 'Reported Date', 'Updated Date', 'Pothole Count', 'User', 'Image URL'];
        const rows = potholes.map(p => [
            p.potholeId,
            p.latitude,
            p.longitude,
            p.severity,
            p.status,
            new Date(p.reportedDate).toLocaleDateString(),
            p.updatedDate ? new Date(p.updatedDate).toLocaleDateString() : '',
            p.potholeCount || 0,
            p.user?.name || '',
            p.potholeImage || ''
        ]);
        const csvContent = [headers, ...rows].map(row =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pothole_reports_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">Pothole Reports</h1>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
                >
                    <FaDownload /> Export CSV
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">
                <input
                    type="text"
                    placeholder="Search by ID, user name, or email..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
                />
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="REPORTED">Reported</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="FIXED">Fixed</option>
                    <option value="IGNORED">Ignored</option>
                </select>
                <select
                    value={severityFilter}
                    onChange={e => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="ALL">All Severities</option>
                    <option value="HIGH">High</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="LOW">Low</option>
                </select>
                <span className="text-sm text-gray-500 ml-auto">{filteredPotholes.length} result{filteredPotholes.length !== 1 ? 's' : ''}</span>
            </div>

            <table className="min-w-full mt-4 border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border px-2 py-2 text-center">ID</th>
                        <th className="border px-2 py-2 text-center">Image</th>
                        <th className="border px-2 py-2 text-center">City</th>
                        <th className="border px-2 py-2 text-center">Severity</th>
                        <th className="border px-2 py-2 text-center">Status</th>
                        <th className="border px-2 py-2 text-center">Reported Date</th>
                        <th className="border px-2 py-2 text-center">View</th>
                        <th className="border px-2 py-2 text-center">User</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPotholes.map((pothole) => (
                        <tr key={pothole.potholeId} className="hover:bg-gray-100">
                            <td className="border px-2 py-2 text-center">{pothole.potholeId}</td>
                            <td className="border p-1 text-center">
                                {pothole.potholeImage ? (
                                    <img
                                        src={ApiService.getImageUrl(pothole.potholeImage)}
                                        alt="Pothole"
                                        className="h-16 w-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity mx-auto"
                                        onClick={() => setPreviewImage(ApiService.getImageUrl(pothole.potholeImage))}
                                    />
                                ) : (
                                    <span className="text-gray-400 text-sm">No Image</span>
                                )}
                            </td>
                            <td className="border px-2 py-2 text-center">Coimbatore</td>
                            <td className="border px-2 py-2 text-center">{pothole.severity}</td>
                            <td className="border px-2 py-2 text-center">{pothole.status}</td>
                            <td className="border px-2 py-2 text-center">{new Date(pothole.reportedDate).toLocaleDateString()}</td>
                            <td className="border px-2 py-2 text-center">
                                <div className="flex justify-center items-center">
                                    <button
                                        onClick={() => setSelectedPothole(pothole)}
                                        className="bg-green-400 text-white p-1 rounded hover:bg-emerald-600"
                                    >
                                        <FaEye className="text-white h-8 w-6" />
                                    </button>
                                </div>
                            </td>
                            <td className="border px-2 py-5 flex items-center justify-center">
                                <div className="relative group">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-green-400 text-white font-bold"
                                        title={pothole.user.name}
                                    >
                                        {pothole.user.name.charAt(0)}
                                    </div>
                                    <span className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100">
                                        {pothole.user.name}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="bg-gray-300 text-gray-800 text-sm sm:text-base px-4 py-2 rounded hover:bg-gray-400"
                >
                    Previous
                </button>
                <p className="text-sm sm:text-base">
                    Page {currentPage} of {totalPages}
                </p>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="bg-gray-300 text-gray-800 text-sm sm:text-base px-4 py-2 rounded hover:bg-gray-400"
                >
                    Next
                </button>
            </div>

            {/* Render Dialog for selected pothole */}
            <Dialog
                pothole={selectedPothole}
                onClose={() => setSelectedPothole(null)}
                onEdit={() => console.log('Edit pothole:', selectedPothole)}
            />

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-3xl max-h-[85vh] p-2" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-3 -right-3 bg-white text-gray-700 rounded-full p-2 shadow-lg hover:bg-red-500 hover:text-white transition-colors z-10"
                        >
                            <FaTimes />
                        </button>
                        <img
                            src={previewImage}
                            alt="Pothole Preview"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
