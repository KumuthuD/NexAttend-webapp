import React, { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import { Users, CheckCircle, Clock, Server } from 'lucide-react';
import { healthCheck } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('loading');

    useEffect(() => {
        const checkBackend = async () => {
            try {
                await healthCheck();
                setApiStatus('connected');
            } catch (error) {
                setApiStatus('error');
            }
        };
        checkBackend();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-2">Welcome back, <span className="text-violet-400 font-semibold">{user?.name || 'Guest'}</span>! Here's your comprehensive attendance overview.</p>
                {/* API Status Indicator */}
                <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${apiStatus === 'connected' ? 'bg-green-500/10 text-green-400' :
                        apiStatus === 'error' ? 'bg-red-500/10 text-red-400' :
                            'bg-yellow-500/10 text-yellow-400'
                    }`}>
                    <Server size={16} className="mr-2" />
                    {apiStatus === 'connected' ? 'Backend Connected' :
                        apiStatus === 'error' ? 'Backend Disconnected' :
                            'Connecting to Backend...'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Students</p>
                            <h3 className="text-2xl font-bold text-white">1,234</h3>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Present Today</p>
                            <h3 className="text-2xl font-bold text-white">95%</h3>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Late Arrivals</p>
                            <h3 className="text-2xl font-bold text-white">12</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="Recent Activity">
                <div className="space-y-4">
                    <p className="text-gray-400 text-sm">No recent activity to show.</p>
                </div>
            </Card>
        </div>
    );
};

export default DashboardPage;
