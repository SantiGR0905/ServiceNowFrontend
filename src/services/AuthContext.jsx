import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(null); 
    const [userTypeId, setUserTypeId] = useState(null);
    const [permissionId, setPermissionId] = useState(null);

    const login = (userId, userType, permission) => {
        setUserId(userId);
        setUserTypeId(userType);
        setPermissionId(permission);
    };

    const logout = () => {
        setUserId(null);    
        setUserTypeId(null);
        setPermissionId(null);
    };

    return (
        <AuthContext.Provider value={{ userId, userTypeId, permissionId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};