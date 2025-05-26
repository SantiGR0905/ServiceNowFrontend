import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/FindServices.css';

export default function FindServices() {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await axios.get('https://servicenow.somee.com/api/PersonalServices');
        // Filtrar servicios no eliminados
        const activeServices = res.data.filter(service => !service.isDeleted);
        setServices(activeServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Error al cargar los servicios. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter(service => {
    return service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           service.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleBookNow = (serviceId) => {
    navigate(`/BookService/${serviceId}`);
  };

  if (isLoading) {
    return <div className="loading">Cargando servicios...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="find-services-container">
      <h1>Encuentra Servicios</h1>
      
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar servicios"
          />
          <i className="search-icon">🔍</i>
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron servicios que coincidan con tu búsqueda.</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="clear-filters"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.map(service => (
            <div key={service.serviceId} className="service-card">
              <div className="card-header">
                <h3>{service.serviceName}</h3>
              </div>
              <p className="service-description">{service.description}</p>
              
              <div className="card-footer">
                <button 
                  onClick={() => handleBookNow(service.serviceId)}
                  className="book-button"
                >
                  Reservar Ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}