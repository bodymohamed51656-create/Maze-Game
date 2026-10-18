const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateMaze } = require('./maze');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const rooms = {};

io.on('connection', (socket) => {
    console.log(`🟢 متصل جديد: ${socket.id}`);

    socket.on('create_room', () => {
        const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[roomId] = { players: [], maze: null };
        socket.join(roomId);
        
        rooms[roomId].players.push({ id: socket.id, role: 'Guide' });
        socket.emit('room_created', { roomId, role: 'Guide' });
    });

    socket.on('join_room', (roomId) => {
        roomId = roomId.toUpperCase();
        const room = rooms[roomId];

        if (!room) {
            socket.emit('room_error', 'Room not found! Please check the code.');
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('room_error', 'Room is full!');
            return;
        }

        socket.join(roomId);
        const role = 'Runner';
        room.players.push({ id: socket.id, role: role });
        
        socket.emit('joined', { role, roomId });

        if (room.players.length === 2) {
            room.maze = generateMaze(31, 31);
            io.to(roomId).emit('game_start', { maze: room.maze, startPos: { r: 1, c: 1 } });
        }
    });

    socket.on('move', (data) => {
        socket.to(data.roomId).emit('player_moved', data);
    });

    // --- أحداث الفويس شات ---
    socket.on('voice_ready', (data) => {
        socket.to(data.roomId).emit('voice_ready');
    });

    socket.on('voice_offer', (data) => {
        socket.to(data.roomId).emit('voice_offer', data.offer);
    });

    socket.on('voice_answer', (data) => {
        socket.to(data.roomId).emit('voice_answer', data.answer);
    });

    socket.on('ice_candidate', (data) => {
        socket.to(data.roomId).emit('ice_candidate', data.candidate);
    });

    socket.on('disconnect', () => {
        console.log(`🔴 فقدان الاتصال: ${socket.id}`);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل بنجاح على البورت ${PORT}`);
});