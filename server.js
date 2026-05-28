const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

let gameState = {
  tiles: 21,
  currentPlayer: 1,
  gameOver: false
};

io.on("connection", (socket) => {

  console.log("A player connected");

  socket.emit("gameState", gameState);

  socket.on("takeTiles", (amount) => {

    if (gameState.gameOver) {
      return;
    }

    if (amount > gameState.tiles) {
      return;
    }

    gameState.tiles -= amount;

    if (gameState.tiles === 0) {
      gameState.gameOver = true;
    } else {
      gameState.currentPlayer =
        gameState.currentPlayer === 1 ? 2 : 1;
    }

    io.emit("gameState", gameState);
  });

});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});