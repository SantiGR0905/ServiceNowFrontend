import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/ClientAppointments.css';

export default function ClientAppointments() {
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  // Obtener customerId
  useEffect(() => {
    const fetchCustomerId = async () => {
      try {
        const res = await axios.get(`http://servicenow.somee.com/api/Customers`, {
          params: { usersUserId: userId }
        });

        if (res.data.length > 0) {
          setCustomerId(res.data[0].customerId);
        } else {
          setError('Usuario no registrado como cliente');
        }
      } catch (error) {
        setError('Error al cargar datos del cliente');
      }
    };

    if (userId) {
      fetchCustomerId();
    } else {
      navigate('/login');
    }
  }, [userId, navigate]);

  // Obtener todos los proveedores y servicios
  useEffect(() => {
    const fetchProvidersAndServices = async () => {
      try {
        const [providersRes, servicesRes] = await Promise.all([
          axios.get(`http://servicenow.somee.com/api/Providers`, {
            params: {
              _embed: 'users',
            }
          }),
          axios.get(`http://servicenow.somee.com/api/PersonalServices`)
        ]);

        setProviders(providersRes.data);
        setServices(servicesRes.data);
      } catch (error) {
        console.error('Error al cargar proveedores y servicios:', error);
        setError('Error al cargar información adicional');
      }
    };

    fetchProvidersAndServices();
  }, []);

  // Obtener todas las citas
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!customerId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const appointmentsRes = await axios.get(`http://servicenow.somee.com/api/Appointments`, {
          params: { customersCustomerId: customerId }
        });

        // Procesar citas con la información de proveedores y servicios
        const processedAppointments = appointmentsRes.data.map(appointment => {
          const providerId = appointment.providers?.providerId;
          const provider = providers.find(p => p.providerId === providerId);
          const providerUser = provider?.users;
          const providerService = provider?.personalServices;
          const fullService = services.find(s => s.serviceId === providerService?.serviceId);

          return {
            ...appointment,
            serviceName: fullService?.serviceName || providerService?.serviceName || 'Servicio no especificado',
            providerName: providerUser 
              ? `${providerUser.firstName} ${providerUser.lastName}`
              : 'Proveedor no especificado',
            fullDate: new Date(appointment.appointmentDate),
            status: appointment.status || 'pending'
          };
        });

        setAppointments(processedAppointments);
      } catch (error) {
        console.error('Error al cargar citas:', error);
        setError('Error al cargar las citas');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (customerId && providers.length > 0 && services.length > 0) {
      fetchAppointments();
    }
  }, [customerId, providers, services]);

  // Cancelar cita
  const cancelAppointment = async (appointmentId) => {
    try {
      await axios.patch(`http://servicenow.somee.com/api/Appointments/${appointmentId}`, {
        status: 'cancelled'
      });
      setAppointments(appointments.map(app =>
        app.appointmentId === appointmentId ? { ...app, status: 'cancelled' } : app
      ));
    } catch (error) {
      setError('Error al cancelar la cita');
    }
  };

  // Marcar cita como completada
  const completeAppointment = async (appointmentId) => {
    try {
      await axios.patch(`http://servicenow.somee.com/api/Appointments/${appointmentId}`, {
        status: 'completed'
      });
      setAppointments(appointments.map(app =>
        app.appointmentId === appointmentId ? { ...app, status: 'completed' } : app
      ));
    } catch (error) {
      setError('Error al marcar la cita como completada');
    }
  };

  // Formatear fecha
  const formatDateTime = (date) => {
    try {
      return format(date, "dd/MM/yyyy 'a las' HH:mm");
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="client-appointments">
      <div className="header-with-back">
        <h2>Mis Citas</h2>
        <button
          onClick={() => navigate('/Profile')}
          className="back-button"
        >
          Volver a Perfil
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading">Cargando citas...</div>
      ) : appointments.length === 0 ? (
        <div className="no-appointments">
          No tienes citas programadas
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map(appointment => (
            <div key={appointment.appointmentId} className={`appointment-card ${appointment.status}`}>
              <div className="appointment-header">
                <h3>{appointment.serviceName}</h3>
                <span className={`status-badge ${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="appointment-details">
                <p>
                  <strong>Profesional:</strong> {appointment.providerName}
                </p>
                <p>
                  <strong>Fecha:</strong> {formatDateTime(appointment.fullDate)}
                </p>
                <p>
                  <strong>Dirección:</strong> {appointment.address || 'No especificada'}
                </p>
                <p>
                  <strong>Notas:</strong> {appointment.notes || 'Ninguna'}
                </p>
                <p>
                  <strong>Estado:</strong> {appointment.status}
                </p>
              </div>

              <div className="appointment-actions">
                {appointment.fullDate <= new Date() && appointment.status === 'pending' && (
                  <button
                    onClick={() => {
                      if (window.confirm('¿Desea marcar esta cita como completada?')) {
                        completeAppointment(appointment.appointmentId);
                      }
                    }}
                    className="complete-btn"
                  >
                    Marcar como Completada
                  </button>
                )}

                {appointment.fullDate > new Date() && appointment.status === 'pending' && (
                  <button
                    onClick={() => {
                      if (window.confirm('¿Está seguro que desea cancelar esta cita?')) {
                        cancelAppointment(appointment.appointmentId);
                      }
                    }}
                    className="cancel-btn"
                  >
                    Cancelar Cita
                  </button>
                )}

                {/* Botón de calificación para TODAS las citas */}
                <Link
                  to={`/RateService/${appointment.appointmentId}`}
                  className="rate-btn"
                  style={{marginLeft: '10px'}}
                >
                  Calificar Servicio
                </Link>

                {appointment.status === 'cancelled' && (
                  <span className="cancelled-label">Cita cancelada</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}