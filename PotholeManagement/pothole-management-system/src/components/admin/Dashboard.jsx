import React, { useState, useEffect } from 'react';
import Graph from './Graph';
import Table from './Table';
import ApiService from '../../services/ApiService';

export default function Dashboard() {
    const [stats, setStats] = useState({ reported: 0, underReview: 0, fixed: 0, ignored: 0 });

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await ApiService.getPotholesData();
                const potholes = data || [];
                setStats({
                    reported: potholes.filter(p => p.status === 'REPORTED').length,
                    underReview: potholes.filter(p => p.status === 'UNDER_REVIEW').length,
                    fixed: potholes.filter(p => p.status === 'FIXED').length,
                    ignored: potholes.filter(p => p.status === 'IGNORED').length,
                });
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="p-4 flex flex-col gap-4">
            {/* Pie Graph */}
            <div>
                <Graph reported={stats.reported} underReview={stats.underReview} fixed={stats.fixed} ignored={stats.ignored} />
            </div>

            {/* Title and Button */}
            <div className='flex flex-col items-start w-full'>
                <div className='text-white flex items-center w-full p-2 bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-300 font-medium rounded-lg text-sm px-5 py-2.5'>
                    <i className="fa-solid fa-server font-bold w-5 mr-2"></i>
                    <div className='font-medium'>Pothole Table</div>
                </div>

                {/* Table */}
                <div className="w-full">
                    <Table />
                </div>

            </div>
        </div >
    );
}
