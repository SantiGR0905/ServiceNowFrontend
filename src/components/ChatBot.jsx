import React, { useState } from 'react';
import '../assets/Chatbot.css';

const preguntasPorCategoria = {
  Reservas: [
    {
      pregunta: "¿Cómo programo un servicio a domicilio?",
      respuesta: "Usa nuestro calendario interactivo para seleccionar fecha y hora disponible. Elige la categoría de servicio y sigue los pasos para confirmar tu cita.",
    },
    {
      pregunta: "¿Puedo modificar o cancelar una reserva?",
      respuesta: "Sí, accede a 'Mis Citas' en tu perfil. Podrás reprogramar o cancelar con 24 horas de anticipación sin costo.",
    },
    {
      pregunta: "¿Cómo sé si mi reserva fue confirmada?",
      respuesta: "Recibirás una notificación por correo y en la app con los detalles del profesional asignado y horario pactado.",
    },
  ],
  Profesionales: [
    {
      pregunta: "¿Cómo verifican a los proveedores?",
      respuesta: "Todos los profesionales pasan por validación de documentos, certificaciones y revisiones de antecedentes antes de unirse a la plataforma.",
    },
    {
      pregunta: "¿Puedo elegir al profesional específico?",
      respuesta: "Sí, nuestro sistema muestra perfiles verificados con especialidades, disponibilidad y calificaciones para que selecciones al mejor candidato.",
    },
    {
      pregunta: "¿Qué pasa si el profesional no llega?",
      respuesta: "Contamos con un sistema de garantía. Reporta la incidencia y te ayudaremos a reprogramar con otro profesional o gestionar un reembolso.",
    },
  ],
  Pagos: [
    {
      pregunta: "¿Es seguro pagar en la plataforma?",
      respuesta: "Usamos encriptación SSL y pasarelas de pago certificadas. Nunca compartimos tus datos financieros con terceros.",
    },
    {
      pregunta: "¿Qué métodos de pago aceptan?",
      respuesta: "Tarjetas crédito/débito, transferencias bancarias y billeteras digitales. Los precios incluyen IVA donde aplique.",
    },
    {
      pregunta: "¿Ofrecen factura electrónica?",
      respuesta: "Sí, al finalizar el servicio generarás automáticamente tu factura desde la sección 'Historial de Pagos'.",
    },
  ],
  Comunicación: [
    {
      pregunta: "¿Cómo contacto al profesional asignado?",
      respuesta: "Usa nuestro chat integrado para coordinar detalles del servicio. Toda comunicación queda registrada en la plataforma para tu seguridad.",
    },
    {
      pregunta: "¿Comparten mi número telefónico con los proveedores?",
      respuesta: "No. La comunicación se realiza exclusivamente a través del chat de ServiceNow para proteger tu privacidad.",
    },
  ],
  Reseñas: [
    {
      pregunta: "¿Cómo funciona el sistema de calificaciones?",
      respuesta: "Al finalizar el servicio, podrás calificar de 1 a 5 estrellas y dejar comentarios. Estas reseñas son visibles para todos los usuarios.",
    },
    {
      pregunta: "¿Puedo editar mi reseña después de publicarla?",
      respuesta: "Sí, tienes 48 horas para modificar tu calificación y comentarios desde la sección 'Historial de Servicios'.",
    },
  ],
  "Problemas Técnicos": [
    {
      pregunta: "¿Qué hago si la app no carga mi ubicación?",
      respuesta: "Verifica los permisos de ubicación en tu dispositivo. Si persiste el problema, contáctanos vía email a soporte@servicenow.com.",
    },
    {
      pregunta: "¿Mi progreso se pierde si cierro la app?",
      respuesta: "No. Todas las reservas y chats se guardan automáticamente en tu cuenta vinculada al correo electrónico.",
    },
  ],
};

const Chatbot = () => {
  const [visible, setVisible] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('Reservas');
  const [preguntaAbierta, setPreguntaAbierta] = useState(null);

  const categorias = Object.keys(preguntasPorCategoria);

  const manejarVisibilidad = () => setVisible(!visible);
  const cambiarCategoria = (categoria) => {
    setCategoriaActiva(categoria);
    setPreguntaAbierta(null);
  };
  const togglePregunta = (index) => setPreguntaAbierta(preguntaAbierta === index ? null : index);

  return (
    <div className="chatbot-container">
      <button 
        className={`chatbot-toggle ${visible ? 'activo' : ''}`}
        onClick={manejarVisibilidad}
        aria-label={visible ? "Cerrar chat de ayuda" : "Abrir chat de ayuda"}
      >
        {visible ? '×' : '💬'}
      </button>

      {visible && (
        <div className="chatbot-contenido">
          <header className="chatbot-header">
            <h2>Centro de Ayuda ServiceNow</h2>
            <p>¿En qué podemos ayudarte hoy?</p>
          </header>

          <nav className="categorias">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                className={`categoria ${categoriaActiva === categoria ? 'activa' : ''}`}
                onClick={() => cambiarCategoria(categoria)}
              >
                {categoria}
              </button>
            ))}
          </nav>

          <div className="preguntas">
            {preguntasPorCategoria[categoriaActiva].map((pregunta, index) => (
              <article key={index} className="pregunta">
                <button 
                  className={`pregunta-btn ${preguntaAbierta === index ? 'abierta' : ''}`}
                  onClick={() => togglePregunta(index)}
                  aria-expanded={preguntaAbierta === index}
                >
                  <span>{pregunta.pregunta}</span>
                  <span className="indicador">{preguntaAbierta === index ? '−' : '+'}</span>
                </button>
                
                {preguntaAbierta === index && (
                  <div className="respuesta">
                    <p>{pregunta.respuesta}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;