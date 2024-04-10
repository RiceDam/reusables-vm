const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const path = require('path');

const PORT = process.env.PORT || 3001;

let activeViewer = null;
let waitlist = [];
let accessTimeout = null;
const ACCESS_DURATION = 60000; // 60 seconds or 1 minute

function grantAccessToNextViewer() {
    io.to(activeViewer).emit('timeout');
    if (waitlist.length > 0) {
        activeViewer = waitlist.shift();
        io.to(activeViewer).emit('accessGranted');
        // Notify the rest about their new position in the waitlist
        waitlist.forEach((id, newPosition) => {
            io.to(id).emit('updatePosition', { newPosition: newPosition + 1 });
        });
        // Start the timeout for the new viewer
        startAccessTimeout();
    } else {
        activeViewer = null;
    }
}

function startAccessTimeout() {
    // Clear any existing timeout to avoid multiple timers running
    if (accessTimeout) {
        clearTimeout(accessTimeout);
    }
    accessTimeout = setTimeout(() => {
        console.log(`Access for viewer ${activeViewer} timed out.`);
        grantAccessToNextViewer();
    }, ACCESS_DURATION);
}

io.on('connection', (socket) => {
    socket.on('requestAccess', () => {
        if (!activeViewer) {
            activeViewer = socket.id;
            io.to(socket.id).emit('accessGranted');
            startAccessTimeout();
        } else {
            waitlist.push(socket.id);
            io.to(socket.id).emit('addedToWaitlist', { position: waitlist.length });
        }
    });

    // Handle disconnects, timeouts, etc.
    socket.on('disconnect', () => {
        if (socket.id === activeViewer) {
            console.log(`Active viewer ${socket.id} disconnected.`);
            activeViewer = null;
            // Grant access to the next person in line, if there is one
            grantAccessToNextViewer();
        } else {
            // Remove from waitlist if they're not the active viewer but in the waitlist
            const index = waitlist.indexOf(socket.id);
            if (index !== -1) {
                waitlist.splice(index, 1);
                // Optionally, notify the rest about their new position in the waitlist
                waitlist.forEach((id, newPosition) => {
                    io.to(id).emit('updatePosition', { newPosition: newPosition + 1 });
                });
            }
        }
    });
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
    });
}


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));