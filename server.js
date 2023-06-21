const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const deckFolderPath = path.join(__dirname, 'cards');

// Read the card files from the deck folder
const deck = fs.readdirSync(deckFolderPath);

// Shuffle the deck
shuffle(deck);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO connection
io.on('connection', function (socket) {
    console.log('A user connected');

    // Send the initial deck to the client
    socket.emit('deck', deck);

    // Draw card event
    socket.on('drawCard', function (player) {
        if (deck.length > 0) {
            const card = deck.pop(); // Remove the last card from the deck
            io.emit('cardDrawn', card, player);

            if (deck.length === 0) {
                io.emit('deckEmpty');
            }

            // Notify opponent about the card drawn
            const opponent = player === 'player1' ? 'player2' : 'player1';
            socket.broadcast.emit('opponentCardDrawn', card, opponent);
        }
    });

    // Handle disconnect
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
});

// Shuffle the deck
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// Start the server
server.listen(3000, function () {
    console.log('Server is running on port 3000');
});
