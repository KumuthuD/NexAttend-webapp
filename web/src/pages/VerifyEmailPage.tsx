import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                await verifyEmail(token);
                setStatus('success');
                setMessage('Email verified successfully!');
                setTimeout(() => navigate('/login'), 3000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.detail || 'Verification failed. The link may have expired.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f1117] px-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-white/5 text-center transition-colors duration-300">
                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verifying...</h2>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verified!</h2>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
                    </>
                )}
                
                <p className="text-gray-500 dark:text-gray-400">{message}</p>
                
                {status === 'success' && (
                    <p className="text-sm text-gray-400 mt-4">Redirecting to login...</p>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
