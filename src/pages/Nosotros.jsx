import React from 'react';
import { Link } from "react-router-dom";
import '../assets/Nosotros.css'; 

const Nosotros = () => {
  return (
    <div className="nosotros-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">ServiNow</h1>
          <nav>
            <Link to="/Nosotros" className="active-link">Nosotros</Link>
            <Link to="/login" className="btn-login">Iniciar Sesión</Link>
            <Link to="/registrarse" className="btn-login">Registrarse</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1>Conoce ServiceNow</h1>
        <p>Una plataforma innovadora desarrollada en la Universidad de Cundinamarca</p>
      </section>

      {/* Contenido principal */}
      <main className="main-content">
        <section className="section">
          <h2>¿Qué es ServiceNow?</h2>
          <div className="content-card">
            <p className="summary">
              ServiceNow es una plataforma digital que conecta a usuarios con profesionales verificados para servicios a domicilio como limpieza, plomería, electricidad y más. Ofrece gestión de citas, historial de servicios y comunicación directa.
            </p>
          </div>
        </section>

        <div className="grid-section">
          <section className="content-card">
            <h3>Nuestra Motivación</h3>
            <p>
              Los usuarios enfrentan dificultades para encontrar proveedores confiables y coordinar horarios, mientras los profesionales carecen de visibilidad. ServiceNow soluciona esto con un sistema centralizado y automatizado.
            </p>
          </section>

          <section className="content-card">
            <h3>Ventajas Clave</h3>
            <ul className="feature-list">
              <li>Calendario interactivo en tiempo real</li>
              <li>Sistema de reputación con reseñas</li>
              <li>Filtros por categoría</li>
            </ul>
          </section>
        </div>

        {/* Equipo */}
        <section className="section">
          <h2>Nuestro Equipo</h2>
          <div className="team-grid">
            <div className="profile-card">
              <h3>Julián Santiago Gutiérrez Rodríguez</h3>
              <p>Ingeniería de Sistemas y Computación</p>
            </div>
            <div className="profile-card">
              <h3>Diego Alexander Pinzon Camargo</h3>
              <p>Ingeniería de Sistemas y Computación</p>
            </div>
          </div>
          <p className="university">Universidad de Cundinamarca</p>
        </section>

        {/* Metodología */}
        <section className="section">
          <h2>Metodología de Desarrollo</h2>
          <div className="content-card methodology">
            <h4>Agile RUP</h4>
            <p>Combinación de prácticas ágiles con las 4 fases de RUP:</p>
            <ul className="phase-list">
              <li><strong>Incepción:</strong> Definición de visión y alcance</li>
              <li><strong>Elaboración:</strong> Prototipado y validación técnica</li>
              <li><strong>Construcción:</strong> Desarrollo iterativo con feedback</li>
              <li><strong>Transición:</strong> Despliegue y capacitación de usuarios</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Nosotros;