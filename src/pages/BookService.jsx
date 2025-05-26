import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/BookService.css';
import { format } from 'date-fns';

export default function BookService() {
  const { serviceId } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedDuration, setSelectedDuration] = useState('01:00');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        navigate('/login');
        return;
      }

      if (!serviceId) {
        setError('Servicio no especificado');
        return;
      }

      setIsLoading(true);
      try {
        // Obtener servicio
        const servicesRes = await axios.get('https://servicenow.somee.com/api/PersonalServices');
        const foundService = servicesRes.data.find(
          s => s.serviceId === Number(serviceId) && !s.isDeleted
        );

        if (!foundService) throw new Error('Servicio no disponible');
        setService(foundService);

        // Obtener proveedores
        const providersRes = await axios.get('https://servicenow.somee.com/api/Providers', {
          params: { isDeleted: false, _embed: 'users' }
        });

        const validProviders = providersRes.data.filter(p => 
          p.personalServices?.serviceId === Number(serviceId) && 
          p.users &&
          !p.isDeleted
        );
        
        if (validProviders.length === 0) throw new Error('No hay profesionales disponibles');
        
        setProviders(validProviders);
        setSelectedProvider(validProviders[0].providerId.toString());

      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [serviceId, userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!userId) {
        navigate('/login');
        return;
      }

      // Obtener customerId
      const customerRes = await axios.get('https://servicenow.somee.com/api/Customers', {
        params: { usersUserId: userId }
      });
      
      if (!customerRes.data[0]?.customerId) {
        navigate('/complete-profile', {
          state: { 
            warning: 'Complete su perfil para reservar',
            returnUrl: `/BookService/${serviceId}`
          }
        });
        return;
      }
      const customerId = customerRes.data[0].customerId;

      // Validaciones
      if (!selectedProvider) throw new Error('Seleccione un profesional');
      if (selectedDate < new Date()) throw new Error('Fecha no válida');

      // Crear cita
      const appointmentData = {
        appointmentDate: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
        address,
        notes: notes || 'Sin notas adicionales',
        createdAt: new Date().toISOString(),
        time: selectedTime,
        duration: selectedDuration,
        customerId,
        providerId: parseInt(selectedProvider)
      };

      const response = await axios.post(
        'https://servicenow.somee.com/api/Appointments',
        appointmentData
      );

      if (response.status === 201) {
        navigate('/Appointments', {
          state: { 
            success: `Cita para ${service.serviceName} creada exitosamente!`,
            newAppointment: response.data
          }
        });
      }

    } catch (error) {
      setError(error.response?.data?.title || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <div className="action-buttons">
          <button onClick={() => navigate('/FindServices')}>Ver servicios</button>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (!service) {
    return <div className="loading">Cargando servicio...</div>;
  }

  return (
    <div className="book-service-container">
      <h1>Reservar: {service.serviceName}</h1>
      <p className="service-description">{service.description}</p>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <label>Profesional:</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            required
            disabled={isLoading}
          >
            {providers.map(provider => (
              <option key={provider.providerId} value={provider.providerId}>
                {provider.users.firstName} {provider.users.lastName}
                {provider.users.phoneNumber && ` - 📞 ${provider.users.phoneNumber}`}
              </option>
            ))}
          </select>
        </div>

        <div className="time-selection">
          <div className="form-group">
            <label>Fecha:</label>
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              required
            />
          </div>

          <div className="form-group">
            <label>Hora:</label>
            <select
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
              required
            >
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'].map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Duración:</label>
            <select
              value={selectedDuration}
              onChange={e => setSelectedDuration(e.target.value)}
              required
            >
              <option value="01:00">1 hora</option>
              <option value="01:30">1.5 horas</option>
              <option value="02:00">2 horas</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Dirección:</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Ingrese dirección completa"
            required
          />
        </div>

        <div className="form-group">
          <label>Notas:</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Detalles adicionales..."
            rows={3}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`submit-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Creando cita...' : 'Confirmar Reserva'}
        </button>
      </form>
    </div>
  );
}