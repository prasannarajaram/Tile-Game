const socket = io();

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("gameState", (state) => {

  tiles = state.tiles;
  currentPlayer = state.currentPlayer;
  gameOver = state.gameOver;

  renderTiles();
});

let tiles;
let currentPlayer;
let gameOver;

function renderTiles() {
  const board = document.getElementById("board");

  board.innerHTML = "";

  for (let i = 0; i < tiles; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    board.appendChild(tile);
  }
  document.getElementById("btn1").disabled = tiles < 1;
  document.getElementById("btn2").disabled = tiles < 2;
  document.getElementById("btn3").disabled = tiles < 3;
  document.getElementById("btn4").disabled = tiles < 4;

  if (gameOver){
    document.getElementById("status").innerHTML =
    `
    Player ${currentPlayer}'s wins
    <br><br>
    <button onclick="resetGame()">Reset Board</button>
    `;
  } else {
    document.getElementById("status").innerText =
    `Tiles remaining: ${tiles} | Player ${currentPlayer}'s turn`;
  }
}

function takeTiles(amount) {

    if (gameOver) {
        return;
    }

  if (amount > tiles) {
    return;
  }

  socket.emit("takeTiles", amount);

  renderTiles();

  if (tiles === 0) {
    gameOver = true;
    renderTiles();
    return;
  }
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  renderTiles();
}

function resetGame() {
    console.log("Reset Clicked");
    tiles = 21;
    currentPlayer = 1;
    gameOver = false;
    renderTiles()
}

renderTiles();