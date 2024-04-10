import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io("/", { path: "/socket.io/" });

function ContentPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState(null);

  useEffect(() => {
    socket.connect();

    socket.emit('requestAccess');

    const setAccess = () => {
      setHasAccess(true);
      setWaitlistPosition(null);
    }

    const addToWaitlist = (data) => {
      setWaitlistPosition(data.position);
    }

    const updatePosition = (data) => {
      setWaitlistPosition(data.newPosition);
    }

    const timeout = () => {
      setHasAccess(false);
      setWaitlistPosition(null);
    }

    socket.on('accessGranted', setAccess);

    socket.on('addedToWaitlist', addToWaitlist);

    socket.on('updatePosition', updatePosition);

    socket.on('timeout', timeout);

    return () => {
      socket.off('accessGranted', setAccess);
      socket.off('addedToWaitlist', addToWaitlist);
      socket.off('updatePosition', updatePosition);
      socket.off('timeout', timeout);
      socket.disconnect();
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

export default ContentPage;
