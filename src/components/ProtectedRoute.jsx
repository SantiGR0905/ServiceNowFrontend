import { useAuth } from "../services/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children, requiredUserType, requiredPermission }) => {
    const { userId, userTypeId, permissionId } = useAuth();

    if (userTypeId !== requiredUserType || permissionId !== requiredPermission ) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;