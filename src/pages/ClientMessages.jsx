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
        const res = await axios.get(`http://servicenow.somee.com/api/Messages?appointmentId=${appointmentId}`);
        setMessages(res.data.filter(m => !m.isDeleted));
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
      await axios.post('http://servicenow.somee.com/api/Messages', {
        appointmentId,
        userId: user.userId,
        messageText: newMessage
      });
      setNewMessage('');
      const res = await axios.get(`http://servicenow.somee.com/api/Messages?appointmentId=${appointmentId}`);
      setMessages(res.data.filter(m => !m.isDeleted));
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
              {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
