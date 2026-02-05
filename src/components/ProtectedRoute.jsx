import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access a wrong role
        // or just to their allowed home
        const knownRoles = ['student', 'teacher', 'admin'];
        if (user.role && knownRoles.includes(user.role)) {
            return <Navigate to={`/${user.role}`} replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
