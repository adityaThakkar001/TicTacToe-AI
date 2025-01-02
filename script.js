document.addEventListener("DOMContentLoaded", () => {
  class State {
    constructor(old, move) {
      this.turn = "";
      this.depth = 0;
      this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      this.result = "active";
      if (old) {
        for (let i = 0; i < 9; i++) {
          this.board[i] = old.board[i];
        }
        this.turn = old.turn;
        this.depth = old.depth;
        this.result = old.result;
      }
      if (move) {
        this.turn = move.turn;
        this.board[move.position] = move.turn;

        if (move.turn === "O") {
          this.depth++;
        }

        this.turn = move.turn == "X" ? "O" : "X";
      }
      this.emptyCells = function () {
        let indexes = [];
        for (let i = 0; i < 9; i++) {
          if (this.board[i] === 0) {
            indexes.push(i);
          }
        }
        return indexes;
      };
      this.gameOver = function () {
        // Checking horizontally
        for (let i = 0; i <= 6; i += 3) {
          if (
            this.board[i] !== 0 &&
            this.board[i] === this.board[i + 1] &&
            this.board[i + 1] === this.board[i + 2]
          ) {
            this.result = this.board[i];
            return true;
          }
        }

        // Checking vertically
        for (let i = 0; i <= 2; i++) {
          if (
            this.board[i] !== 0 &&
            this.board[i] === this.board[i + 3] &&
            this.board[i + 3] === this.board[i + 6]
          ) {
            this.result = this.board[i];
            return true;
          }
        }

        // Checking diagonally
        if (
          this.board[4] !== 0 &&
          ((this.board[0] === this.board[4] &&
            this.board[4] === this.board[8]) ||
            (this.board[2] === this.board[4] &&
              this.board[4] === this.board[6]))
        ) {
          this.result = this.board[4];
          return true;
        }

        // Checking for draw
        if (this.emptyCells().length === 0) {
          this.result = "draw";
          return true;
        }

        return false;
      };
    }
  }

  class AI {
    constructor() {
      let game = {};
      let nextMove;
      this.AISymbol = "";
      this.plays = function (_game) {
        game = _game;
      };
      this.minimax = function (state, depth, isMaximizing) {
        if (state.gameOver() || depth === 0) {
          return game.score(state);
        }

        const currentPlayer = isMaximizing
          ? this.AISymbol
          : this.AISymbol === "X"
          ? "O"
          : "X";
        let bestScore = isMaximizing ? -Infinity : Infinity;
        let bestMove = null;
        const moves = state.emptyCells();

        for (let i = 0; i < moves.length; i++) {
          const newState = new State(state, {
            turn: currentPlayer,
            position: moves[i],
          });
          const score = this.minimax(newState, depth - 1, !isMaximizing);

          if (isMaximizing) {
            if (score > bestScore) {
              bestScore = score;
              bestMove = moves[i];
            }
          } else {
            if (score < bestScore) {
              bestScore = score;
              bestMove = moves[i];
            }
          }
        }
        if (depth === 9) {
          return { score: bestScore, move: bestMove }; 
        }

        return bestScore; 
      };

      this.takeMove = function (_state) {
        console.log("AI thinking...");
        const result = this.minimax(_state, 9, true);
        const bestMove = result.move; 
        console.log("AI chose move:", bestMove);
        let newState = new State(_state, {
          turn: this.AISymbol,
          position: bestMove,
        });
        game.advanceTo(newState);
      };
    }
  }

  class Game {
    constructor(AI) {
      this.ai = AI;
      this.currentState = new State();
      this.currentState.turn = "X";
      this.status = "start";

      this.advanceTo = function (_state) {
        this.currentState = _state;
      };

      this.start = function () {
        if ((this.status = "start")) {
          this.advanceTo(this.currentState);
          this.status = "running";
        }
      };

      this.updateUI = function () {
        let board = this.currentState.board;
        for (let i = 0; i < 9; i++) {
          let selector = "#b" + i;
          let cell = document.querySelector(selector);
          if (board[i]) {
            cell.innerHTML = `<span class="symbol ${board[i].toLowerCase()}">${
              board[i]
            }</span>`;
          } else {
            cell.innerHTML = "";
          }
        }

        if (this.currentState.gameOver()) {
          let message = "";

          if (this.currentState.result == "draw") {
            message = "It's a draw.";
          } else if (this.currentState.result != playerSymbol) {
            message = "You lose!";
          } else {
            message = "You win!";
          }
          playGrid.style.transform = "scale(0.5)";
          document.querySelector(".text").innerText = message;
        }
      };

      this.isValid = function (space) {
        if (this.currentState.board[space] == 0) {
          return true;
        } else {
          return false;
        }
      };
      this.score = function (_state) {
        if (_state.result !== "active") {
          if (_state.result === this.ai.AISymbol) {
            return 10 - _state.depth;
          } else if (_state.result !== "draw") {
            return -10 + _state.depth;
          } else {
            return 0;
          }
        }
        return _state.depth % 2 === 0 ? -1 : 1; 
      };
    }
  }

  let myAI;
  let myGame;

  let playerSymbol = "";
  let compSymbol = "";

  let playerTurn;

  let playGame = function () {
    myAI = new AI();
    myGame = new Game(myAI);
    myAI.plays(myGame);
    myGame.ai = myAI;
    myGame.updateUI();

    myAI.AISymbol = compSymbol;
    Game.prototype.playerSymbol = playerSymbol;

    function fadeOut(element, duration, callback) {
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = 0;

      setTimeout(function () {
        element.style.display = "none";
        if (callback) callback();
      }, duration);
    }

    function fadeIn(element, duration, callback) {
      element.style.display = "";
      element.style.opacity = 0;
      element.style.transition = `opacity ${duration}ms`;

      requestAnimationFrame(function () {
        element.style.opacity = 1;
      });

      setTimeout(function () {
        if (callback) callback();
      }, duration);
    }
    fadeOut(document.querySelector(".choice-screen"), 600, function () {
      fadeIn(document.querySelector(".play-grid"), 600, function () {
        fadeIn(document.querySelector("#replay"), 1000, function () {
          if (myAI.AISymbol === "X") {
            myGame.ai.takeMove(myGame.currentState);
            myGame.updateUI();
            playerTurn = true;
          }
        });
      });
    });
  };

  document.querySelectorAll(".choice-button").forEach(function (button) {
    button.addEventListener("click", function () {
      playerSymbol = this.id;

      if (playerSymbol === "X") {
        compSymbol = "O";
        playerTurn = true;
      } else {
        compSymbol = "X";
        playerTurn = false;
      }

      playGame();
    });
  });

  document.querySelectorAll(".cell").forEach(function (space) {
    space.addEventListener("click", function () {
      let num = this.id;
      console.log(num);
      num = num.substring(1); 
      if (playerTurn && myGame.isValid(num)) {
        let newState = new State(myGame.currentState, {
          turn: playerSymbol,
          position: num,
        });

        myGame.advanceTo(newState);
        myGame.updateUI();
        playerTurn = false;

        setTimeout(function () {
          myGame.ai.takeMove(myGame.currentState);
          myGame.updateUI();
          playerTurn = true;
        }, 1000);
      }
    });
  });

  document.getElementById("replay").addEventListener("click", () => {
    document.body.classList.add("fade-out");
    setTimeout(function () {
      location.reload();
    }, 500);
  });
});
