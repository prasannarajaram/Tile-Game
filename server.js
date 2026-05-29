// --------------------------------------------------
// Store connected players
// key   = socket.id
// value = player number (1, 2, or 0 for spectator)
// --------------------------------------------------
let players = {};


// --------------------------------------------------
// Import required libraries
// --------------------------------------------------
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");


// --------------------------------------------------
// Create Express application
// --------------------------------------------------
const app = express();


// --------------------------------------------------
// Create HTTP server using Express app
// Socket.IO attaches to this HTTP server
// --------------------------------------------------
const server = http.createServer(app);


// --------------------------------------------------
// Create Socket.IO server
// --------------------------------------------------
const io = new Server(server);


// --------------------------------------------------
// Serve frontend files from "public" folder
// Example:
//   public/index.html
//   public/script.js
//   public/style.css
// --------------------------------------------------
app.use(express.static("public"));


// --------------------------------------------------
// Global shared game state
// This is the "source of truth" for all players
// --------------------------------------------------
let gameState = {
  tiles: 21,
  currentPlayer: 1,
  gameOver: false
};


// --------------------------------------------------
// Runs whenever a new browser connects
// --------------------------------------------------
io.on("connection", (socket) => {

  console.log("A player connected:", socket.id);


  // ------------------------------------------------
  // Assign player number
  //
  // First connection  -> Player 1
  // Second connection -> Player 2
  // Additional users  -> Spectators (0)
  // ------------------------------------------------
  let playerNumber;

  if (!Object.values(players).includes(1)) {
    playerNumber = 1;

  } else if (!Object.values(players).includes(2)) {
    playerNumber = 2;

  } else {
    playerNumber = 0;
  }


  // Save player assignment
  players[socket.id] = playerNumber;


  // Send assigned player number to client
  socket.emit("playerAssignment", playerNumber);


  // Send current game state to newly connected client
  socket.emit("gameState", gameState);


  // ------------------------------------------------
  // Handle tile-taking move
  // ------------------------------------------------
  socket.on("takeTiles", (amount) => {

    // Get player number for current socket
    const playerNumber = players[socket.id];


    // Reject move if:
    // - not this player's turn
    if (playerNumber !== gameState.currentPlayer) {
      return;
    }


    // Reject move if game already ended
    if (gameState.gameOver) {
      return;
    }


    // Reject invalid move
    // Example:
    // trying to take 4 when only 2 remain
    if (amount > gameState.tiles) {
      return;
    }


    // Apply move
    gameState.tiles -= amount;


    // Check win condition
    if (gameState.tiles === 0) {

      gameState.gameOver = true;

    } else {

      // Switch turns
      gameState.currentPlayer =
        gameState.currentPlayer === 1 ? 2 : 1;
    }


    // Broadcast updated game state to ALL clients
    io.emit("gameState", gameState);
  });


  // ------------------------------------------------
  // Handle game reset
  // ------------------------------------------------
  socket.on("resetGame", () => {

    // Reset game state
    gameState.tiles = 21;
    gameState.currentPlayer = 1;
    gameState.gameOver = false;


    // Broadcast fresh game state to everyone
    io.emit("gameState", gameState);
  });


  // ------------------------------------------------
  // Handle player disconnect
  // ------------------------------------------------
  socket.on("disconnect", () => {

    console.log("Player disconnected:", socket.id);

    // Remove player from player list
    delete players[socket.id];
  });

});


// --------------------------------------------------
// Render provides PORT dynamically in production
// Local machine falls back to port 3000
// --------------------------------------------------
const PORT = process.env.PORT || 3000;


// --------------------------------------------------
// Start server
// --------------------------------------------------
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});