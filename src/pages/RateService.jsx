import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import '../assets/RateService.css';
import { format } from 'date-fns';

export default function RateService() {
  const { appointmentId } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [provider, setProvider] = useState(null);
  const [service, setService] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        if (!appointmentId || !userId) return;

        setIsLoading(true);
        setError(null);

        // 1. Obtener detalles de la cita
        const appointmentRes = await axios.get(`https://servicenow.somee.com/api/Appointments/${appointmentId}`);
        
        // 2. Obtener información del cliente
        const customerRes = await axios.get('https://servicenow.somee.com/api/Customers', {
          params: { usersUserId: userId }
        });

        if (!customerRes.data?.length) {
          throw new Error('Complete su perfil de cliente primero');
        }

        // 3. Verificar IDs con múltiples posibles propiedades
        const customerId = Number(customerRes.data[0].customerId);
        const citaCustomerId = Number(
          appointmentRes.data.customerId ||
          appointmentRes.data.customerID ||
          appointmentRes.data.customersCustomerId ||
          appointmentRes.data.customer?.customerId
        );

        if (isNaN(citaCustomerId)) {
          throw new Error('Formato de ID inválido en la cita');
        }

        if (customerId !== citaCustomerId) {
          throw new Error('No tiene permisos para calificar esta cita');
        }

        // 4. Cargar datos adicionales
        setAppointment(appointmentRes.data);

        if (appointmentRes.data.providersProviderId) {
          const providerRes = await axios.get(`https://servicenow.somee.com/api/Providers/${appointmentRes.data.providersProviderId}`, {
            params: { _embed: 'users' }
          });
          setProvider(providerRes.data);

          if (providerRes.data.personalServices?.serviceId) {
            const serviceRes = await axios.get(`https://servicenow.somee.com/api/PersonalServices/${providerRes.data.personalServices.serviceId}`);
            setService(serviceRes.data);
          }
        }

      } catch (error) {
        console.error('Error:', error);
        setError(error.response?.data?.title || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId, userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://servicenow.somee.com/api/Ratings', {
        appointmentId: Number(appointmentId),
        userId: Number(userId),
        score: rating,
        review,
        createdAt: new Date().toISOString()
      });
      navigate('/Appointments', { state: { success: 'Calificación enviada!' } });
    } catch (error) {
      setError(error.response?.data?.title || error.message);
    }
  };

  if (isLoading) return <div className="loading">Cargando...</div>;
  if (error) return (
    <div className="error-container">
      <h2>Error</h2>
      <p>{error}</p>
      <div className="action-buttons">
        <button onClick={() => navigate('/Appointments')}>Volver</button>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    </div>
  );

  return (
    <div className="rate-service-container">
      <h1>Calificar Servicio</h1>
      
      <div className="appointment-info">
        <p><strong>Servicio:</strong> {service?.serviceName || 'No especificado'}</p>
        <p><strong>Profesional:</strong> {provider?.users?.firstName || 'No especificado'} {provider?.users?.lastName}</p>
        <p><strong>Fecha:</strong> {appointment?.appointmentDate ? format(new Date(appointment.appointmentDate), 'dd/MM/yyyy HH:mm') : 'No especificada'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rating-section">
          <label>Calificación:</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= rating ? 'filled' : ''}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="review-section">
          <label>Reseña:</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Describa su experiencia..."
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/Appointments')}>
            Cancelar
          </button>
          <button type="submit">
            Enviar Calificación
          </button>
        </div>
      </form>
    </div>
  );
}