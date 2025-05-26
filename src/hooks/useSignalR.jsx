// hooks/useSignalR.js
import { useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

export const useSignalR = () => {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('http://servicenow.somee.com/MessageHub')
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  return { connection };
};