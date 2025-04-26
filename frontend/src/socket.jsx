import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL;

// Initialize the socket instance
const socket = io(apiUrl, {
  withCredentials: true,
  autoConnect: true, // Automatically connect
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket"], // Specify transports if needed
});

export default socket;