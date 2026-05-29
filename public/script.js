// --------------------------------------------------
// Connect browser to Socket.IO server
// --------------------------------------------------
const socket = io();


// --------------------------------------------------
// Local client-side copy of shared game state
//
// NOTE:
// Server owns the true state.
// Client only renders received state.
// --------------------------------------------------
let tiles;
let currentPlayer;
let gameOver;


// --------------------------------------------------
// Player identity assigned by server
//
// 1 = Player 1
// 2 = Player 2
// 0 = Spectator
// --------------------------------------------------
let myPlayerNumber = 0;


// --------------------------------------------------
// Runs when browser successfully connects to server
// --------------------------------------------------
socket.on("connect", () => {
  console.log("Connected to server");
});


// --------------------------------------------------
// Receive assigned player number from server
// --------------------------------------------------
socket.on("playerAssignment", (playerNumber) => {

  myPlayerNumber = playerNumber;

  // Update UI with player identity
  document.getElementById("player-info").innerText =
    myPlayerNumber === 0
      ? "You are a Spectator"
      : `You are Player ${myPlayerNumber}`;
});


// --------------------------------------------------
// Receive updated game state from server
//
// This is the main synchronization mechanism.
// Every connected browser receives same state.
// --------------------------------------------------
socket.on("gameState", (state) => {

  // Update local variables
  tiles = state.tiles;
  currentPlayer = state.currentPlayer;
  gameOver = state.gameOver;

  // Re-render UI
  renderTiles();
});


// --------------------------------------------------
// Render game board and UI
// --------------------------------------------------
function renderTiles() {

  const board = document.getElementById("board");

  // Clear previous board
  board.innerHTML = "";


  // Create tile elements
  for (let i = 0; i < tiles; i++) {

    const tile = document.createElement("div");

    tile.classList.add("tile");

    board.appendChild(tile);
  }


  // ------------------------------------------------
  // Update status message
  // ------------------------------------------------
  if (gameOver) {

    document.getElementById("status").innerHTML =
      `
      Player ${currentPlayer} wins
      <br><br>
      <button onclick="resetGame()">Reset Board</button>
      `;

  } else {

    document.getElementById("status").innerText =
      `Tiles remaining: ${tiles} | Player ${currentPlayer}'s turn`;
  }


  // ------------------------------------------------
  // Enable buttons only:
  // - during player's own turn
  // - if enough tiles remain
  // ------------------------------------------------
  const myTurn = myPlayerNumber === currentPlayer;

  document.getElementById("btn1").disabled =
    !myTurn || tiles < 1;

  document.getElementById("btn2").disabled =
    !myTurn || tiles < 2;

  document.getElementById("btn3").disabled =
    !myTurn || tiles < 3;

  document.getElementById("btn4").disabled =
    !myTurn || tiles < 4;
}


// --------------------------------------------------
// Send tile-taking request to server
//
// IMPORTANT:
// Client does NOT directly modify state.
// Server validates and updates state.
// --------------------------------------------------
function takeTiles(amount) {

  // Ignore invalid clicks after game end
  if (gameOver) {
    return;
  }

  // Send move request to server
  socket.emit("takeTiles", amount);
}


// --------------------------------------------------
// Request server to reset shared game
// --------------------------------------------------
function resetGame() {

  socket.emit("resetGame");
}