import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import '../assets/Principal.css';
import ChatBot from '../components/ChatBot';

function Principal() {
  const [stats, setStats] = useState({
    providers: 0,
    services: 0,
    appointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [featuredServices, setFeaturedServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, usersRes, appointmentsRes] = await Promise.all([
          axios.get('https://servicenow.somee.com/api/PersonalServices'),
          axios.get('https://servicenow.somee.com/api/Users'),
          axios.get('https://servicenow.somee.com/api/Appointments')
        ]);

        // Procesar estadísticas
        const providers = usersRes.data.filter(u => 
          !u.isDeleted && u.userTypes?.userType === 'Provider'
        ).length;

        setStats({
          providers,
          services: servicesRes.data.filter(s => !s.isDeleted).length,
          appointments: appointmentsRes.data.filter(a => !a.isDeleted).length
        });

        // Obtener 4 servicios aleatorios
        const activeServices = servicesRes.data.filter(s => !s.isDeleted);
        const shuffled = [...activeServices].sort(() => 0.5 - Math.random());
        setFeaturedServices(shuffled.slice(0, 4));
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="principal">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">ServiNow</h1>
          <nav>
            <Link to="/Nosotros">Nosotros</Link>
            <Link to="/login" className="btn-login">Iniciar Sesión</Link>
            <Link to="/registrarse" className="btn-login">Registrarse</Link>
          </nav>
        </div>
      </header>

      {/* Stats */}
      <section className="stats">
        <div className="stat-card">
          <h3>{loading ? '...' : stats.providers}</h3>
          <p>Profesionales</p>
        </div>
        <div className="stat-card">
          <h3>{loading ? '...' : stats.services}</h3>
          <p>Servicios</p>
        </div>
        <div className="stat-card">
          <h3>{loading ? '...' : stats.appointments}</h3>
          <p>Citas realizadas</p>
        </div>
      </section>

      {/* Featured Services */}
      <section className="featured-services">
        <h2>Servicios Destacados</h2>
        <div className="services-grid">
          {loading ? (
            <p>Cargando servicios...</p>
          ) : (
            featuredServices.map(service => (
              <Link 
                to={`/book-service/${service.serviceId}`} 
                key={service.serviceId} 
                className="service-card"
              >
                <h3>{service.serviceName}</h3>
                <p>{service.description || 'Servicio profesional'}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>Lo que dicen nuestros usuarios</h2>
        <div className="testimonial-card">
          <p>"Encontré un electricista en 15 minutos que resolvió mi problema el mismo día"</p>
          <p className="author">- Carlos M.</p>
        </div>
      </section>
      <ChatBot />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ServiNow</h3>
            <p>Conectando profesionales con clientes</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces</h4>
            <Link to="/about">Nosotros</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Principal;