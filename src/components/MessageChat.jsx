// components/MessageChat.js
import React, { useState, useEffect } from 'react';
import { useSignalR } from '../hooks/useSignalR';

const MessageChat = ({ appointmentId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { connection } = useSignalR();

  useEffect(() => {
    const loadMessages = async () => {
      const response = await axios.get(`http://servicenow.somee.com/api/Messages/${appointmentId}`);
      setMessages(response.data);
    };
    loadMessages();
  }, [appointmentId]);

  useEffect(() => {
    if (connection) {
      connection.on('ReceiveMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });
    }
  }, [connection]);

  const sendMessage = async (e) => {
    e.preventDefault();
    await api.post('/messages', {
      messageText: newMessage,
      appointmentId,
    });
    setNewMessage('');
  };

  return (
    <div className="message-chat">
      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.messageId} className="message">
            <span className="sender">{msg.sender}:</span>
            <p className="text">{msg.messageText}</p>
            <span className="time">{new Date(msg.sentAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
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
};

export default MessageChat;