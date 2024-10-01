const socket = io();

let playerType = '';
let currentPlayer = 'X';
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');

socket.on('playerType', (type) => {
    playerType = type;
    statusText.textContent = `Você é o jogador: ${playerType}`;
});
socket.on('gameState', (gameState) => {
    const { board, currentPlayer: current } = gameState;
    updateBoard(board);
    currentPlayer = current;
    statusText.textContent = `É a vez de ${currentPlayer}`;
});

socket.on('gameOver', (result) => {
    if (result.winner === 'empate') {
        statusText.textContent = 'O jogo terminou em empate!';
    } else {
        highlightWinner(result.winningCells);
        statusText.textContent = `O jogador ${result.winner} venceu!`;
    }
    setTimeout(() => {
        resetBoard();
        statusText.textContent = 'Novo jogo! Você é o jogador: ' + playerType;
    }, 3000);
});

cells.forEach((cell, index) => {
    cell.addEventListener('click', () => {
        if (cell.textContent === '' && currentPlayer === playerType) {
            socket.emit('makeMove', index);
        }
    });
});

function updateBoard(board) {
    board.forEach((mark, index) => {
        cells[index].textContent = mark;
    });
}

function highlightWinner(winningCells) {
    winningCells.forEach(index => {
        cells[index].classList.add('winner');
    });
}

function resetBoard() {
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winner');
    });
}
