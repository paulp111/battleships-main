import "./styles.scss";
import "./selectionScreen.js";

// --------------- Global ---------------
let isHorizontal = true;
const shipForms = {
  ship1: {
    size: 4,
    offsets: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  },
  ship2: {
    size: 3,
    offsets: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  },
  ship3: {
    size: 2,
    offsets: [
      [0, 0],
      [0, 1],
    ],
  },
};
const maxPlayerShips = Object.keys(shipForms).length;

class Gameboard {
  constructor(size) {
    this.size = size;
    this.squares = Array(size * size).fill(null);
    this.attacks = Array(size * size).fill(null);
  }
  allShipsSunk() {
    return this.squares.every((val, idx) => val !== "ship" || this.attacks[idx] === "hit");
  }

  receiveAtk(index) {
    if (this.squares[index] === "ship") {
      this.attacks[index] = "hit";
    } else {
      this.attacks[index] = "miss";
    }
  }
}

class ComputerPlayer {
  constructor(gameboard) {
    this.gameboard = gameboard;
  }

  placeShipsRnd(shipForms) {
    for (const shipFormKey in shipForms) {
      let placed = false;
      while (!placed) {
        const size = shipForms[shipFormKey].size;
        const isHorizontal = Math.random() >= 0.5;
        const row = Math.floor(Math.random() * (isHorizontal ? 10 : 10 - size));
        const col = Math.floor(Math.random() * (isHorizontal ? 10 - size : 10));

        if (this.canPlaceShip(size, row, col, isHorizontal)) {
          this.placeShip(size, row, col, isHorizontal);
          placed = true;
        }
      }
    }
  }

  canPlaceShip(size, row, col, isHorizontal) {
    for (let i = 0; i < size; i++) {
      if (
        this.gameboard.squares[
          (row + (isHorizontal ? 0 : i)) * 10 + (col + (isHorizontal ? i : 0))
        ] === "ship"
      ) {
        return false;
      }
    }
    return true;
  }

  placeShip(size, row, col, isHorizontal) {
    for (let i = 0; i < size; i++) {
      this.gameboard.squares[
        (row + (isHorizontal ? 0 : i)) * 10 + (col + (isHorizontal ? i : 0))
      ] = "ship";
    }
  }

  takeTurn(playerGameboard) {
    let index;
    do {
      index = Math.floor(
        Math.random() * playerGameboard.size * playerGameboard.size
      );
    } while (playerGameboard.attacks[index] !== null);
    playerGameboard.receiveAtk(index);
    return index;
  }
}

// --------------- Gameboard Squares ---------------
function createGameboard(gameboardDOM, clickHandler) {
  if (!gameboardDOM) {
    console.error("The provided gameboard element is undefined.");
    return;
  }

  gameboardDOM.style.width = "400px";
  gameboardDOM.style.maxWidth = "100%";
  gameboardDOM.style.height = "400px";
  gameboardDOM.style.display = "flex";
  gameboardDOM.style.flexWrap = "wrap";

  for (let i = 0; i < 100; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.dataset.index = i;
    square.addEventListener("click", clickHandler);
    styleSquare(square);
    gameboardDOM.appendChild(square);
  }
}

// --------------- Square styles ---------------
function styleSquare(square) {
  square.style.width = "40px";
  square.style.height = "40px";
  square.style.border = "1px solid black";
  square.style.boxSizing = "border-box";
  square.style.float = "left";
}

// --------------- Ship Config ---------------
let gameStarted = false;
let playerShipsPlaced = 0;

// --------------- Load Game ---------------
document.addEventListener("DOMContentLoaded", () => {
  const gameboardPlayerDOM = document.getElementById("gameboard-player");
  const gameboardComputerDOM = document.getElementById("gameboard-computer");

  if (!gameboardPlayerDOM || !gameboardComputerDOM) {
    console.error("Die Spielbrett-DOM-Elemente wurden nicht gefunden.");
    return;
  }

  const gameboardPlayer = new Gameboard(10);
  const gameboardComputer = new Gameboard(10);
  const computerPlayer = new ComputerPlayer(gameboardComputer);

  createGameboard(gameboardPlayerDOM, playerBoardClick);
  createGameboard(gameboardComputerDOM, computerBoardClick);

  function placeShip(square, shipForm, gameboardDOM) {
    const index = parseInt(square.dataset.index);
    const shipRow = Math.floor(index / 10);
    const shipCol = index % 10;
    let canPlaceShip = true;

    const offsets = shipForm.offsets.map((offset) =>
      isHorizontal ? offset : [offset[1], offset[0]]
    );

    for (const [dx, dy] of offsets) {
      const targetRow = shipRow + dx;
      const targetCol = shipCol + dy;
      if (
        targetRow < 0 ||
        targetRow >= 10 ||
        targetCol < 0 ||
        targetCol >= 10 ||
        gameboardPlayer.squares[targetRow * 10 + targetCol] === "ship"
      ) {
        canPlaceShip = false;
        break;
      }
    }
    function startGame() {
      gameStarted = true;
      computerPlayer.placeShipsRnd(shipForms);
      console.log("Das Spiel hat begonnen!");
    }

    if (canPlaceShip) {
      for (const [dx, dy] of offsets) {
        const targetIndex = (shipRow + dx) * 10 + (shipCol + dy);
        gameboardPlayer.squares[targetIndex] = "ship";
        const targetSquare = gameboardDOM.children[targetIndex];
        if (targetSquare) {
          targetSquare.classList.add("ship");
        }
      }
      playerShipsPlaced++;
      if (playerShipsPlaced === maxPlayerShips) {
        startGame();
      }
    } else {
      console.log("Schiff kann hier nicht platziert werden.");
    }
  }


  // Ship Placement
  function placeShip(square, shipForm) {
    const index = parseInt(square.dataset.index);
    const shipRow = Math.floor(index / 10);
    const shipCol = index % 10;
    let canPlaceShip = true;

    //--------------- Offsets/Ausrichtung ---------------
    const offsets = shipForm.offsets.map((offset) =>
      isHorizontal ? offset : [offset[1], offset[0]]
    );

    //--------------- Check Placement ---------------

    //--------------- Valid Placement ---------------
    if (canPlaceShip) {
      for (const [dx, dy] of offsets) {
        const targetRow = shipRow + dx;
        const targetCol = shipCol + dy;
        const targetIndex = targetRow * 10 + targetCol;
        const targetSquare = gameboardPlayer.children[targetIndex];
        targetSquare.classList.add("ship");
      }
      playerShipsPlaced++;
    } else {
      console.log("Schiff kann hier nicht platziert werden.");
    }
  }

  //--------------- Hrz/Vert Button ---------------
  const rotateBtn = document.getElementById("rotate-button");
  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      isHorizontal = !isHorizontal;
      rotateBtn.textContent = isHorizontal ? "Horizontal" : "Vertikal";
      console.log(
        `Schiffsausrichtung: ${isHorizontal ? "horizontal" : "vertikal"}`
      );
    });
    rotateBtn.textContent = "Horizontal";
  }

//--------------- Check Game Over ---------------
// needs fix

  /*function checkGameOver() {
    if (gameboardPlayer.allShipsSunk()) {
      alert("Die KI hat gewonnen!");
      gameStarted = false; // Beendet das Spiel
    } else if (gameboardComputer.allShipsSunk()) {
      alert("Du hast gewonnen!");
      gameStarted = false; // Beendet das Spiel
    }
  }*/
  
  

  //------------Player Gameboard Click-------------

  function playerBoardClick(event) {
    if (gameStarted && playerShipsPlaced === maxPlayerShips) {
        // Player on Comp
        const playerShotIndex = parseInt(event.target.dataset.index);
        
        if (!gameboardComputer.attacks[playerShotIndex]) {
            gameboardComputer.receiveAtk(playerShotIndex);
            if (gameboardComputer.attacks[playerShotIndex] === "hit") {
                event.target.style.backgroundColor = "green";
            } else {
                event.target.style.backgroundColor = "red";
            }

            // Comp shooting back
            const computerShotIndex = computerPlayer.takeTurn(gameboardPlayer);
            const targetSquare = gameboardPlayerDOM.children[computerShotIndex];
            if (gameboardPlayer.attacks[computerShotIndex] === "hit") {
                targetSquare.style.backgroundColor = "green";
            } else {
                targetSquare.style.backgroundColor = "red";
            }

            checkGameOver(); 
        }
    } else if (gameStarted && playerShipsPlaced < maxPlayerShips) {
        // Ship Placement
        const shipFormKey = sessionStorage.getItem("selectedShipForm");
        placeShip(event.target, shipForms[shipFormKey], gameboardPlayerDOM);
    }
}


  //------------Computer Gameboard Click-------------
  function computerBoardClick(event) {
    if (gameStarted && playerShipsPlaced === maxPlayerShips) {
        const playerShotIndex = parseInt(event.target.dataset.index);
        
        if (!gameboardComputer.attacks[playerShotIndex]) {
            gameboardComputer.receiveAtk(playerShotIndex);
            if (gameboardComputer.attacks[playerShotIndex] === "hit") {
                event.target.style.backgroundColor = "green";
            } else {
                event.target.style.backgroundColor = "red";
            }

            // KI schießt zurück
            const computerShotIndex = computerPlayer.takeTurn(gameboardPlayer);
            const targetSquare = gameboardPlayerDOM.children[computerShotIndex];
            if (gameboardPlayer.attacks[computerShotIndex] === "hit") {
                targetSquare.style.backgroundColor = "green";
            } else {
                targetSquare.style.backgroundColor = "red";
            }

            checkGameOver(); 
        }
    }
}

  

  function playerShoot(square) {
    const index = parseInt(square.dataset.index);
    if (!gameboardComputer.attacks[index]) {
      gameboardComputer.receiveAtk(index);
      if (gameboardComputer.attacks[index] === "hit") {
        square.style.backgroundColor = "green";
      } else {
        square.style.backgroundColor = "red";
      }
    }
  }
  // --------------- Player Ships ---------------

  function placeShip(square, shipForm) {
    const index = parseInt(square.dataset.index);
    const shipRow = Math.floor(index / 10);
    const shipCol = index % 10;
    let canPlaceShip = true;

    // Offsets/Ausrichtung
    const offsets = shipForm.offsets.map((offset) =>
      isHorizontal ? offset : [offset[1], offset[0]]
    );


    // Gültige Platzierung
    if (canPlaceShip) {
      for (const [dx, dy] of offsets) {
        const targetRow = shipRow + dx;
        const targetCol = shipCol + dy;
        const targetIndex = targetRow * 10 + targetCol;
        const targetSquare = gameboardPlayerDOM.children[targetIndex];
        if (targetSquare) {
          targetSquare.classList.add("ship");
        }
      }
      playerShipsPlaced++;
      if (playerShipsPlaced === maxPlayerShips) {
        startGame();
      }
    } else {
      console.log("Schiff kann hier nicht platziert werden.");
    }
  }

  // START GAME
  document.addEventListener("gameStart", () => {
    gameStarted = true;
    computerPlayer.placeShipsRnd(shipForms);
  });

  const gameStartEvent = new Event("gameStart");
  document.dispatchEvent(gameStartEvent);
});
