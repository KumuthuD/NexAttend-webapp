import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../Loading';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('teacher' | 'student')[];
}

/**
 * A wrapper component that protects routes from unauthorized access.
 * It checks the authentication status and optionally the user's role.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth status
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-vh-100">
                <Loading />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        // Save the current location they were trying to access to redirect back after login
        return <Navigate to="/get-started" state={{ from: location }} replace />;
    }

    // Check if role-based access is required and if the user has the required role
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // If user is authenticated but doesn't have the right role, 
        // redirect to their respective dashboard or a 403 page
        const redirectPath = user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
