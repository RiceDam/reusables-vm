import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io("/", { path: "/socket.io/" });

function App() {
  const [hasAccess, setHasAccess] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState(null);

  useEffect(() => {
    socket.emit('requestAccess');

    socket.on('accessGranted', () => {
      setHasAccess(true);
      setWaitlistPosition(null);
    });

    socket.on('addedToWaitlist', (data) => {
      setWaitlistPosition(data.position);
    });

    socket.on('updatePosition', (data) => {
      setWaitlistPosition(data.newPosition);
    });

    socket.on('timeout', () => {
      setHasAccess(false);
      setWaitlistPosition(null);
    });

    return () => {
      socket.off();
    }
  }, []);

  return (
    <div>
      {hasAccess ? (
        <div>Welcome, you have access!</div>
      ) : (
        <div>
          {waitlistPosition !== null ? (
            <div>You are number {waitlistPosition} in the queue.</div>
          ) : (
            <div>Waiting for access...</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
