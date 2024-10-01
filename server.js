const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];

const checkWinner = () => {
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return board.includes('') ? null : 'empate';
}

io.on('connection', (socket) => {
    console.log('Novo jogador conectado: ', socket.id);

    if (!players.X) {
        players.X = socket.id;
        socket.emit('playerType', 'X');
    }else if (!players.O) {
        players.O = socket.id;
        socket.emit('playerType', 'O');
    }

    socket.emit('gameState', { board, currentPlayer });

    socket.on('makeMove', (index) => {
        if (players[currentPlayer] === socket.id && board[index] === '') {
            board[index] = currentPlayer;
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            io.emit('gameState', { board, currentPlayer });

            const winner = checkWinner();
            if (winner) {
                io.emit('gameOver', winner);
                board = ['', '', '', '', '', '', '', '', ''];
                currentPlayer = 'X';
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Jogador desconectado:', socket.id);
        if (players.X === socket.id) {
            delete players.X;
        } else if (players.O === socket.id) {
            delete players.O;
        }
    });

});


app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is running on port 3000');
})