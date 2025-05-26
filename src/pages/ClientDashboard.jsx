import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import NotificationBell from '../components/NotificationBell';
import MessageChat from '../components/MessageChat';
import '../assets/ClientDashboard.css';

export default function ClientDashboard() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    appointments: [],
    frequentProviders: [],
    recentPayments: []
  });
  const [loading, setLoading] = useState({
    main: true,
    appointments: true,
    providers: true,
    payments: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        navigate('/login');
        return;
      }

      try {
        setLoading({ main: true, appointments: true, providers: true, payments: true });
        setError(null);

        // Obtener datos del usuario
        const userRes = await axios.get(`http://servicenow.somee.com/api/Users/${userId}`);
        const userData = userRes.data;

        // Obtener customerId
        const customerRes = await axios.get(`http://servicenow.somee.com/api/Customers`, {
          params: { usersUserId: userId }
        });
        
        if (customerRes.data.length === 0) throw new Error('Cliente no encontrado');
        const customerId = customerRes.data[0].customerId;

        // Cargar datos en paralelo
        const [appointmentsRes, paymentsRes, providersRes] = await Promise.all([
          axios.get(`http://servicenow.somee.com/api/Appointments`, {
            params: { customersCustomerId: customerId, _limit: 3 }
          }),
          axios.get(`http://servicenow.somee.com/api/Payments`, {
            params: { _limit: 5 }
          }),
          axios.get(`http://servicenow.somee.com/api/Providers`)
        ]);

        // Procesar proveedores frecuentes
        const providerCounts = appointmentsRes.data.reduce((acc, app) => {
          acc[app.providersProviderId] = (acc[app.providersProviderId] || 0) + 1;
          return acc;
        }, {});

        const frequentProviders = Object.entries(providerCounts)
          .sort(([,a], [,b]) => b - a)
          .map(([id]) => providersRes.data.find(p => p.providerId == id))
          .filter(p => p)
          .slice(0, 3);

        // Procesar pagos recientes
        const recentPayments = paymentsRes.data
          .filter(p => appointmentsRes.data.some(a => a.appointmentId === p.appointmentsAppointmentId))
          .slice(0, 5);

        setDashboardData({
          profile: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            created: format(new Date(userData.created), 'dd/MM/yyyy HH:mm'),
            userType: userData.userTypesUserTypeId
          },
          appointments: appointmentsRes.data,
          frequentProviders,
          recentPayments
        });

        setLoading({ main: false, appointments: false, providers: false, payments: false });

      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        setLoading({ main: false, appointments: false, providers: false, payments: false });
      }
    };

    fetchData();
  }, [userId, navigate]);

  if (loading.main) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="client-dashboard">
      <header className="dashboard-header">
        <div className="profile-info">
          <h1>Bienvenido, {dashboardData.profile.firstName}!</h1>
          <div className="meta-info">
            <span>{dashboardData.profile.email}</span>
            <span>Miembro desde: {dashboardData.profile.created}</span>
          </div>
        </div>
        <div className="header-actions">
          <NotificationBell />
          <button onClick={logout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div className="dashboard-content">
        {/* Sección de Acciones Rápidas */}
        <section className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="action-grid">
            <button onClick={() => navigate('/book-service')}>📅 Nueva Cita</button>
            <button onClick={() => navigate('/payments')}>💳 Ver Pagos</button>
            <button onClick={() => navigate('/history')}>📚 Historial</button>
          </div>
        </section>

        {/* Próximas Citas */}
        <section className="appointments-section">
          <h2>Próximas Citas {loading.appointments && <small>(cargando...)</small>}</h2>
          <div className="appointments-list">
            {dashboardData.appointments.map(appointment => (
              <div key={appointment.appointmentId} className="appointment-card">
                <div className="appointment-info">
                  <h3>{appointment.serviceName}</h3>
                  <p>📅 {format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')}</p>
                  <p>⏰ {appointment.time}</p>
                  <MessageChat appointmentId={appointment.appointmentId} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Proveedores Frecuentes */}
        <section className="providers-section">
          <h2>Proveedores Frecuentes {loading.providers && <small>(cargando...)</small>}</h2>
          <div className="providers-grid">
            {dashboardData.frequentProviders.map(provider => (
              <div key={provider.providerId} className="provider-card">
                <h4>{provider.users?.firstName} {provider.users?.lastName}</h4>
                <p>📞 {provider.users?.phoneNumber}</p>
                <button onClick={() => navigate(`/providers/${provider.providerId}`)}>
                  Ver Detalles
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Actividad Reciente */}
        <section className="recent-activity">
          <h2>Actividad Reciente {loading.payments && <small>(cargando...)</small>}</h2>
          <div className="payments-list">
            {dashboardData.recentPayments.map(payment => (
              <div key={payment.paymentId} className="payment-card">
                <p>${payment.amount} - {format(new Date(payment.paymentDate), 'dd/MM/yyyy')}</p>
                <span className={`status-${payment.status.toLowerCase()}`}>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}