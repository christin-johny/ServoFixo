import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../../../store/authSlice';
import { technicianLogout } from '../../../../infrastructure/repositories/technician/technicianAuthRepository';
import { useNavigate } from 'react-router-dom';

const TechnicianDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await technicianLogout();
            dispatch(logout());
            navigate('/technician/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Technician Dashboard</h1>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Logout
                    </button>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-2">Profile Status</h2>
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            Incomplete
                        </span>
                        <p className="mt-2 text-gray-600 text-sm">Complete your profile to start receiving jobs.</p>
                        <button className="mt-4 text-blue-600 hover:underline">Complete Profile &rarr;</button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-2">Active Jobs</h2>
                        <p className="text-3xl font-bold text-gray-800">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-2">Earnings</h2>
                        <p className="text-3xl font-bold text-green-600">₹0.00</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;