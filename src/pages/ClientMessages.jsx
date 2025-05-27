import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import '../assets/ClientMessages.css';

export default function ClientMessages() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`https://servicenow.somee.com/api/Messages?appointmentId=${appointmentId}`);
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.userId) return;

    try {
      await axios.post('https://servicenow.somee.com/api/Messages', {
        messageText: newMessage,
        appointmentId: parseInt(appointmentId),
        sentAt: new Date().toISOString()
      });
      setNewMessage('');
      const res = await axios.get(`https://servicenow.somee.com/api/Messages?appointmentId=${appointmentId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user || !user.userId) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div className="client-messages">
      <h2>Chat con el Profesional</h2>

      <div className="messages-container">
        {messages.map(message => (
          <div
            key={message.messageId}
            className={`message ${message.userId === user.userId ? 'sent' : 'received'}`}
          >
            <p>{message.messageText}</p>
            <span className="time">
              {new Date(message.sentAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          aria-label="Escribe tu mensaje"
        />
        <button type="submit" aria-label="Enviar mensaje">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  );
}