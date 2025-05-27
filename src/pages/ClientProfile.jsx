import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import '../assets/ClientProfile.css';

export default function ClientProfile() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    userTypeId: '',
    userTypeName: '',
    created: '',
    isDeleted: false
  });
  const [appointments, setAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  console.log('userId', userId);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        navigate('/login');
        return;
      }

      setIsLoading(true);
      try {
        // Obtener datos del usuario
        const userRes = await axios.get(`https://servicenow.somee.com/api/Users/${userId}`);
        const userData = userRes.data;

        // Obtener tipo de usuario
        let userTypeName = 'No especificado';
        if (userData.userTypesUserTypeId) {
          const typeRes = await axios.get(`https://servicenow.somee.com/api/UserTypes/${userData.userTypesUserTypeId}`);
          userTypeName = typeRes.data.userType;
        }

        setProfile({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          password: '',
          userTypeId: userData.userTypesUserTypeId || '',
          userTypeName: userTypeName,
          created: userData.created ? format(new Date(userData.created), 'dd/MM/yyyy HH:mm') : '',
          isDeleted: userData.isDeleted || false
        });

        // Obtener citas si es cliente
        if (userData.userTypesUserTypeId === 3) { // Asumiendo 3 es Customer
          const customerRes = await axios.get(`https://servicenow.somee.com/api/Customers`, {
            params: { usersUserId: userId }
          });
          
          if (customerRes.data.length > 0) {
            const customerId = customerRes.data[0].customerId;
            const appointmentsRes = await axios.get(`https://servicenow.somee.com/api/Appointments`, {
              params: { customersCustomerId: customerId, limit: 3 }
            });
            setAppointments(appointmentsRes.data);
          }
        }

      } catch (error) {
        console.error('Error al obtener datos:', error);
        setError('Error al cargar los datos del perfil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        userTypesUserTypeId: profile.userTypeId
      };

      await axios.put(`https://servicenow.somee.com/api/Users/${userId}`, updateData);
      
      if (profile.password) {
        await axios.patch(`https://servicenow.somee.com/api/Users/${userId}/password`, {
          newPassword: profile.password
        });
      }

      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setError(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Está seguro que desea marcar su cuenta como eliminada?')) {
      try {
        await axios.patch(`https://servicenow.somee.com/api/Users/${userId}`, {
          isDeleted: true
        });
        logout();
        navigate('/');
      } catch (error) {
        console.error('Error al eliminar cuenta:', error);
        setError('Error al eliminar la cuenta');
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="client-profile-container">
      <div className="profile-header">
        <h1>Mi Perfil</h1>
        <div className="profile-actions">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              Editar Perfil
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)} className="cancel-btn">
              Cancelar
            </button>
          )}
          <button onClick={logout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="profile-content">
        <div className="profile-section">
          <h2>Información Personal</h2>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido:</label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Teléfono:</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nueva Contraseña:</label>
                <input
                  type="password"
                  name="password"
                  value={profile.password}
                  onChange={handleInputChange}
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>
              <div className="form-group">
                <label>Tipo de Usuario:</label>
                <input
                  type="text"
                  value={profile.userTypeName}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Fecha de Creación:</label>
                <input
                  type="text"
                  value={profile.created}
                  disabled
                />
              </div>
              <button type="submit" disabled={isLoading} className="save-btn">
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          ) : (
            <div className="profile-info">
              <p><strong>Nombre:</strong> {profile.firstName} {profile.lastName}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Teléfono:</strong> {profile.phoneNumber || 'No especificado'}</p>
              <p><strong>Miembro desde:</strong> {profile.created}</p>
            </div>
          )}
        </div>
          <div className="quick-navigation">
  <h2>Accesos Rápidos</h2>
  <div className="nav-buttons">
    <button onClick={() => navigate('/Appointments')}>Mis Citas</button>
    <button onClick={() => navigate('/FindServices')}>Buscar Servicios</button>
  </div>
</div>

        {profile.userTypeId === 1 && (
          <div className="appointments-section">
            <h2>Mis Próximas Citas</h2>
            {appointments.length === 0 ? (
              <p>No tienes citas programadas</p>
            ) : (
              <ul className="appointments-list">
                {appointments.map(appointment => (
                  <li key={appointment.appointmentId} className="appointment-item">
                    <div>
                      <h3>Cita #{appointment.appointmentId}</h3>
                      <p><strong>Fecha:</strong> {format(new Date(appointment.appointmentDate), 'PPP')}</p>
                      <p><strong>Hora:</strong> {appointment.time}</p>
                      <p><strong>Dirección:</strong> {appointment.address}</p>
                      <p><strong>Notas:</strong> {appointment.notes || 'Sin notas'}</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/appointments/${appointment.appointmentId}`)}
                      className="details-btn"
                    >
                      Ver Detalles
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button 
              onClick={() => navigate('/appointments')}
              className="view-all-btn"
            >
              Ver todas mis citas
            </button>
          </div>
        )}
      </div>

      <div className="danger-zone">
        <button 
          onClick={handleDeleteAccount}
          className="delete-account-btn"
          disabled={profile.isDeleted}
        >
          {profile.isDeleted ? 'Cuenta eliminada' : 'Eliminar Mi Cuenta'}
        </button>
      </div>
    </div>
  );
}