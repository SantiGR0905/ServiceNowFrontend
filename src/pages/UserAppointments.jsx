import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/UserAppointments.css';

export default function UserAppointments() {
  const { userId, authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [providerId, setProviderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customersMap, setCustomersMap] = useState({});

  // 1. Obtener providerId
  useEffect(() => {
    const fetchProviderId = async () => {
      try {
        const response = await axios.get(
          `http://servicenow.somee.com/api/Providers`,
          { 
            params: { usersUserId: userId },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.length > 0) {
          setProviderId(response.data[0].providerId);
        } else {
          throw new Error('No estás registrado como proveedor');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.response?.data?.message || 'Error de autenticación');
        if (error.response?.status === 401) logout();
      }
    };

    if (userId && !authLoading) fetchProviderId();
  }, [userId, authLoading, logout]);

  // 2. Obtener y procesar datos
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchAllData = async () => {
      try {
        // Obtener citas y clientes en paralelo
        const [appointmentsRes, customersRes] = await Promise.all([
          axios.get(`http://servicenow.somee.com/api/Appointments`, {
            params: { providerId },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            signal: controller.signal
          }),
          axios.get(`http://servicenow.somee.com/api/Customers`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            signal: controller.signal
          })
        ]);

        // Crear mapa de clientes
        const customersMap = customersRes.data.reduce((acc, customer) => {
          acc[customer.customerId] = customer.users;
          return acc;
        }, {});

        // Procesar citas
        const processedAppointments = appointmentsRes.data
          .filter(a => !a.isDeleted)
          .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
          .map(appointment => ({
            ...appointment,
            customerName: customersMap[appointment.customers?.customerId] 
              ? `${customersMap[appointment.customers.customerId].firstName} ${customersMap[appointment.customers.customerId].lastName}`
              : 'Cliente no registrado'
          }));

        setCustomersMap(customersMap);
        setAppointments(processedAppointments);

      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error:', error);
          setError(error.response?.data?.message || 'Error al cargar datos');
        }
      } finally {
        setLoading(false);
      }
    };

    if (providerId) fetchAllData();
    return () => controller.abort();
  }, [providerId]);

  // 3. Manejar cancelación de cita
  const handleCancelAppointment = async (appointmentId) => {
    try {
      await axios.patch(
        `http://servicenow.somee.com/api/Appointments/${appointmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Actualizar estado local
      setAppointments(prev => prev.filter(app => app.appointmentId !== appointmentId));
      
    } catch (error) {
      console.error('Error cancelando cita:', error);
      setError('No se pudo cancelar la cita');
    }
  };

  // 4. Redirección si no autenticado
  useEffect(() => {
    if (!authLoading && !userId) navigate('/login');
  }, [authLoading, userId, navigate]);

  if (authLoading) return <div className="loading">Verificando autenticación...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h3>{error}</h3>
        <div className="error-actions">
          <button onClick={() => window.location.reload()}>Reintentar</button>
          <Link to="/provider" className="nav-button">Volver al panel</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Cargando citas...</div>;

  return (
    <div className="appointments-container">
      <div className="header-section">
        <h2>Mis Citas Programadas</h2>
        <Link to="/provider" className="back-button">
          ← Volver al Panel
        </Link>
      </div>
      
      <div className="appointments-list">
        {appointments.map(appointment => (
          <div key={appointment.appointmentId} className="appointment-card">
            <div className="card-header">
              <h3>{new Date(appointment.appointmentDate).toLocaleDateString()}</h3>
              <div className="time-duration">
                <span>⏰ {appointment.time.substring(0, 5)}</span>
                <span>⏳ {appointment.duration.substring(0, 5)}</span>
              </div>
            </div>
            
            <div className="card-body">
              <p className="customer">👤 {appointment.customerName}</p>
              <p className="service">🏠 {appointment.address}</p>
              {appointment.notes && <p className="notes">📝 {appointment.notes}</p>}
            </div>

            <div className="card-actions">
              <button 
                className="cancel-button"
                onClick={() => handleCancelAppointment(appointment.appointmentId)}
              >
                Cancelar Cita
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}