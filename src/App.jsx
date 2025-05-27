import { useState } from 'react';
import {Routes, Route, Router, useLocation } from 'react-router-dom';
import Principal from "./pages/Principal.jsx";
import IniciarSesion from "./pages/IniciarSesion.jsx";
import Registrarse from "./pages/Registrarse.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
//import AdminService from "./pages/AdminService.jsx";
import BookService from "./pages/BookService.jsx";
import ClientDashboard from "./pages/ClientMessages.jsx";
import ClientMessages from "./pages/ClientMessages.jsx";
import ClientPayments from "./pages/ClientPayments.jsx";
import FinancialReports from "./pages/FinancialReports.jsx";
import FindServices from './pages/FindServices.jsx';
import ManageAppointments from "./pages/ManageAppointments.jsx"
import ManageService from "./pages/ManageService.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import RateService from "./pages/RateService.jsx";
import UserAppointments from "./pages/UserAppointments.jsx"
import UserAvailability from "./pages/UserAvailability.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import UserServices from "./pages/UserServices.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from './services/AuthContext.jsx';
import ClientAppointments from './pages/ClientAppointments.jsx';
import ClientProfile from './pages/ClientProfile.jsx';
import Nosotros from './pages/Nosotros.jsx';

function App() {
  return (
    <AuthProvider>
            <div>
                <Routes>
                    <Route path="/" element={<Principal/>} />
                    <Route path="/Nosotros" element={<Nosotros/>} />
                    <Route path="/Login" element={<IniciarSesion />} />
                    <Route path='/Registrarse' element={<Registrarse/>}/>
                    {/*<Route path="/Chatbot" element={<Chatbot/>} />
                    {/*<Route element={<ProtectedRoute requiredUserType={1} requiredPermission={1}/>}>*/}
                        <Route path="/Admin" element={<AdminDashboard/>} />
                        <Route path="/Admin/Layout" element={<AdminLayout/>} />
                        <Route path="/Admin/Appointments" element={<ManageAppointments/>} />
                        <Route path="/Admin/Services" element={<ManageService/>} />
                        <Route path="/Admin/Users" element={<ManageUsers/>} />
                        <Route path="/Admin/Financial" element={<FinancialReports/>} />
                    {/* </Route>
                    
                    <Route element={<ProtectedRoute requiredUserType={2} requiredPermission={2}/>}>*/}
                        <Route path="/Provider" element={<UserDashboard/>} />
                        <Route path="/Provider/Appointments" element={<UserAppointments/>} />
                        <Route path="/Provider/Availability" element={<UserAvailability/>} />
                        <Route path="/Provider/Profile" element={<UserProfile/>} />
                        <Route path="/Provider/Services" element={<UserServices/>} />
                    {/*</Route>
                    <Route element={<ProtectedRoute requiredUserType={3} requiredPermission={3}/>}>*/}
                        <Route path="/Profile" element={<ClientProfile/>} />
                        <Route path="/BookService/:serviceId" element={<BookService/>} />
                        <Route path="/Appointments" element={<ClientAppointments/>} />
                        <Route path="/Dashboard" element={<ClientDashboard/>} />
                        <Route path="/Messages" element={<ClientMessages/>} />
                        <Route path="/Payments" element={<ClientPayments/>} />
                        <Route path="/FindServices" element={<FindServices/>} />
                        <Route path="/RateService/:appointmentId" element={<RateService/>} />
                    {/*</Route> */}
                </Routes>
            </div>
        </AuthProvider>
  )
}

export default App
