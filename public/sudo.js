import { getSudoku } from "sudoku-gen";
var numSelected = null;
var tileSelected = null;
let currentSudokuState = [];
// Variable global para almacenar los números restantes
let initialRemainingNumbers = null;
// Variable para controlar si los números restantes ya han sido calculados
let selectedCell = null;
let nestedPuzzle = [];
let nestedSolution = [];
let IsOver = false;
let pencilPressed = false;
let candiPressed = false;
var errors = 0;
var solution;
var totalMistakes = 3; // Definir totalMistakes en el alcance global
let numberCount = new Array(9).fill(0); //Contador numeros tablero
let difficulty = "easy";

// Función para obtener los candidatos de todas las celdas vacías en un tablero de sudoku
var pencilTool = document.querySelector(".tool:first-child img");
pencilTool.addEventListener("click", function () {
  // Selecciona el elemento que contiene la imagen del lápiz rápido

  var spanElement = pencilTool.parentElement.querySelector("span");
  // Guarda el color original del texto del span
  spanElement.style.color = "#2f7bda";

  // Agrega un controlador de eventos de clic al elemento del lápiz rápido
  // Llama a la función que calcula los candidatos para todas las celdas vacías
  pencilPressed = !pencilPressed;

  if (pencilPressed) {
    // Si el lápiz está activado, muestra los candidatos
    const allCandidates = getAllCandidates(currentSudokuState);
    insertCandidatesIntoTiles(allCandidates);
    // Cambia el color del texto del span cuando se presiona el botón
    pencilTool.classList.toggle("pressed");
  } else {
    // Si el lápiz está desactivado, elimina todos los candidatos
    document
      .querySelectorAll(".grid-container")
      .forEach((gridContainer) => gridContainer.remove());
    // Restaura el color original del texto del span
    spanElement.style.color = "#aaaaaa";
    pencilTool.classList.remove("pressed");
  }
});

// Función para agregar los candidatos a las celdas manualmente por el usuario
var candidateTool = document.querySelectorAll(".tool")[1].querySelector("img");

candidateTool.addEventListener("click", function () {
  // Selecciona el elemento que contiene la imagen del lápiz de candidatos
  var spanElement = candidateTool.nextElementSibling;
  // Agrega un controlador de eventos de clic al elemento del lápiz de candidatos
  // Cambia el estado del lápiz de candidatos
  candiPressed = !candiPressed;
  if (candiPressed) {
    // Si el lápiz de candidatos está activado, permite agregar y editar candidatos
    console.log("Lápiz de candidatos activado");
    // Cambia el color del texto del span cuando se presiona el botón
    candidateTool.classList.toggle("pressed");
    spanElement.style.color = "#2f7bda";
  } else {
    // Si el lápiz de candidatos está desactivado, elimina todos los candidatos agregados manualmente
    console.log("Lápiz de candidatos desactivado");
    spanElement.style.color = "#aaaaaa";
    candidateTool.classList.remove("pressed");
  }
});

//region bulbPista
// Obtener la herramienta de Pista (bulb)
var bulbTool = document.querySelector(".tool:nth-child(3) img.pista-image");

// Agregar un controlador de eventos de clic a la imagen de Pista (bulb)
bulbTool.addEventListener("click", function () {
  // Si la imagen ya está presionada, quitar la clase; de lo contrario, agregarla
  // Agregar temporalmente la clase "bulb-pressed" solo si es la imagen de la herramienta de Pista (bulb)
  bulbTool.classList.add("bulb-pressed");

  // Esperar un tiempo corto y luego quitar la clase para desactivar la animación
  setTimeout(function () {
    bulbTool.classList.remove("bulb-pressed");
  }, 300); // Ajusta el tiempo según la duración de tu animación CSS

  if (selectedCell) {
    const { row, col } = selectedCell;
    const tile = document.getElementById(`${row}-${col}`);
    if (
      tile &&
      !tile.classList.contains("user-input") &&
      !tile.classList.contains("tile-start")
    ) {
      // Limpiar el contenido de la celda
      tile.innerHTML = "";

      // Verificar si el número de la solución en las coordenadas de la celda seleccionada es diferente de 0
      const solutionNumber = solution[row][col];
      if (solutionNumber !== 0) {
        // Agregar el número directamente al div principal de la celda
        tile.innerText = solutionNumber;
        tile.classList.add("user-input"); // Marcar como número agregado por pista
        tile.classList.add("pista");
        numberCount[solutionNumber - 1]++;
        // Recalcular los candidatos si pencilPressed está en true
        currentSudokuState[row][col] = solutionNumber;
        if (pencilPressed) {
          const allCandidates = getAllCandidates(currentSudokuState);
          insertCandidatesIntoTiles(allCandidates);
        }
      }
      highlightCells(solutionNumber);
    }
  }
});

//Efecto botones #tools

// Función para manejar la introducción de candidatos manualmente en las celdas del tablero
function handleManualCandidateInsertion(selectedCell, candidate) {
  const { row, col } = selectedCell;
  const tile = document.getElementById(`${row}-${col}`);

  // Verificar si el tile es válido y no es de entrada de usuario ni de inicio de tile
  if (
    tile &&
    !tile.classList.contains("user-input") &&
    !tile.classList.contains("tile-start")
  ) {
    // Obtener el grid-container
    let gridContainer = tile.querySelector(".grid-container");

    if (!gridContainer) {
      // Si no existe el grid-container, crearlo
      gridContainer = document.createElement("div");
      gridContainer.classList.add("grid-container");
      tile.appendChild(gridContainer);
    }

    // Agregar la clase "user-modified" al grid-container para indicar que fue modificado por el usuario
    gridContainer.classList.add("user-modified");

    // Obtener todos los candidatos en el grid-container
    const candidates = gridContainer.querySelectorAll(".candidate");

    // Crear una matriz 3x3 para representar la posición de los números en el grid-container
    const positions = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];

    // Verificar si la posición donde se va a ubicar el nuevo número está ocupada
    const position =
      positions[Math.floor((candidate - 1) / 3)][(candidate - 1) % 3];
    const existingCandidate = Array.from(candidates).find((cand) => {
      const candRow = parseInt(cand.style.gridRow);
      const candCol = parseInt(cand.style.gridColumn);
      return (
        candRow === Math.ceil(position / 3) &&
        candCol === (position % 3 === 0 ? 3 : position % 3)
      );
    });

    if (existingCandidate) {
      // Si el candidato ya está presente, eliminarlo del grid-container
      existingCandidate.remove();
    } else {
      // Si el candidato no está presente, agregarlo al grid-container
      const candidateSpan = document.createElement("span");
      candidateSpan.textContent = candidate;
      candidateSpan.classList.add("candidate", "user-candidate");

      // Establecer la posición del candidato en función de la posición en la matriz
      candidateSpan.style.gridColumn = position % 3 === 0 ? 3 : position % 3;
      candidateSpan.style.gridRow = Math.ceil(position / 3);

      // Agregar el candidato al grid-container
      gridContainer.appendChild(candidateSpan);
    }
  }
}

// region CANDIDATES
// Función para obtener los candidatos de todas las celdas vacías en un tablero de sudoku
function getAllCandidates(board) {
  const candidates = [];

  // Recorrer todas las filas del tablero
  for (let row = 0; row < board.length; row++) {
    // Recorrer todas las columnas del tablero
    for (let col = 0; col < board[row].length; col++) {
      // Verificar si la celda está vacía
      if (board[row][col] === 0) {
        // Obtener los candidatos para la celda vacía en la posición (row, col)
        const cellCandidates = getCandidates(board, row, col);
        // Agregar las coordenadas de la celda y sus candidatos al arreglo de candidatos
        candidates.push({ row, col, candidates: cellCandidates });
      }
    }
  }

  return candidates;
}

// Función para obtener los candidatos de una celda vacía en un tablero de sudoku
function getCandidates(board, row, col) {
  const candidates = [];

  // Verificar los números del 1 al 9 para ver si son candidatos válidos
  for (let num = 1; num <= 9; num++) {
    // Verificar si el número es un candidato válido para la celda
    if (isValidCandidate(board, row, col, num)) {
      candidates.push(num);
    }
  }

  return candidates;
}

// Función auxiliar para verificar si un número es un candidato válido para una celda
function isValidCandidate(board, row, col, num) {
  // Verificar si el número ya está en la misma fila
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) {
      return false;
    }
  }

  // Verificar si el número ya está en la misma columna
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) {
      return false;
    }
  }

  // Verificar si el número ya está en la misma caja (subcuadrícula de 3x3)
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if (board[i][j] === num) {
        return false;
      }
    }
  }

  // Si el número no está en la misma fila, columna ni caja, es un candidato válido
  return true;
}

// Función para insertar los candidatos en las celdas vacías
function insertCandidatesIntoTiles(allCandidates) {
  allCandidates.forEach((candidate) => {
    const { row, col, candidates } = candidate;
    const tile = document.getElementById(row + "-" + col);
    if (
      tile &&
      !tile.querySelector(".user-input") && // Verificar si no hay un número de usuario
      !tile.classList.contains("tile-start") && // Verificar si no es un número inicial
      !tile.classList.contains("pista") // Verificar si no es un número agregado por la pista
    ) {
      let gridContainer = tile.querySelector(".grid-container");

      // Verificar si ya existe un grid-container y si tiene la clase user-modified
      if (gridContainer && gridContainer.classList.contains("user-modified")) {
        // Mantener los candidatos existentes y actualizarlos según sea necesario
        const candidateSpans = gridContainer.querySelectorAll(".candidate");
        candidateSpans.forEach((span) => {
          const num = parseInt(span.textContent);
          if (!candidates.includes(num)) {
            span.remove(); // Eliminar los candidatos que ya no están en la lista actual
          }
        });
      } else {
        console.log("se ejecuto el sida de que tiene user-input");
        tile.innerHTML = ""; // Limpiar el contenido existente del tile
        // Si no existe un grid-container o no tiene la clase user-modified, crear uno nuevo
        gridContainer = document.createElement("div");
        gridContainer.classList.add("grid-container");

        // Crear una matriz 3x3 para representar la posición de los números en la celda
        const positions = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ];

        // Insertar cada candidato en su posición correspondiente dentro del grid
        candidates.forEach((num) => {
          const candidateSpan = document.createElement("span");
          candidateSpan.classList.add("candidate");

          // Obtener la posición de la celda en la matriz positions
          const position = positions[Math.floor((num - 1) / 3)][(num - 1) % 3];

          // Establecer la posición del candidato en función de la posición en la matriz
          candidateSpan.style.gridColumn =
            position % 3 === 0 ? 3 : position % 3;
          candidateSpan.style.gridRow = Math.ceil(position / 3);
          candidateSpan.textContent = num;

          gridContainer.appendChild(candidateSpan);
        });

        tile.appendChild(gridContainer); // Insertar el grid en el tile
      }
    }
  });
}

// Función para reiniciar los contadores de los números
function resetNumberCounters() {
  numberCount = new Array(9).fill(0);
}

//region Remainings
// Función para crear los divs de remaining
function createInitialRemainingDivs() {
  const remainingContainer = document.getElementById("remaining-container");

  // Limpiar el contenido anterior del contenedor
  remainingContainer.innerHTML = "";

  // Recorrer los números del 1 al 9
  for (let i = 1; i <= 9; i++) {
    const remaining = document.createElement("div");
    const remainingCount = 9 - initialRemainingNumbers[i - 1]; // Calcular el número restante
    remaining.innerText = remainingCount;
    remaining.classList.add("remaining");
    remaining.dataset.number = i; // Añadir el atributo de datos
    remainingContainer.appendChild(remaining);
  }
}

function createRemainingDivs() {
  const remainingContainer = document.getElementById("remaining-container");

  // Limpiar el contenido anterior del contenedor
  remainingContainer.innerHTML = "";

  // Recorrer los números del 1 al 9
  for (let i = 1; i <= 9; i++) {
    const remaining = document.createElement("div");
    const remainingCount = 9 - numberCount[i - 1]; // Calcular el número restante

    // Verificar si el recuento es mayor que 0 antes de mostrar el valor
    if (remainingCount > 0) {
      remaining.innerText = remainingCount;
    } else {
      remaining.style.backgroundColor = "transparent";
      remaining.style.visibility = "hidden";
    }

    remaining.classList.add("remaining");
    remaining.dataset.number = i; // Añadir el atributo de datos
    remainingContainer.appendChild(remaining);
  }
}

function calculateInitialRemainingNumbers(nestedPuzzle) {
  // Reiniciar el contador de números
  const numberCount = new Array(9).fill(0);

  // Calcular los números restantes inicialmente
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const number = nestedPuzzle[r][c];
      if (number !== 0) {
        numberCount[number - 1]++;
      }
    }
  }

  return numberCount;
}

// region SETGAME
// Función para iniciar el juego con la dificultad seleccionada
function setGame(predefinedPuzzle, predefinedSolution) {
  // Reiniciar los contadores de los números
  numSelected = null;
  clearGame();
  startTimer();
  resetNumberCounters();

  if (predefinedPuzzle && predefinedSolution) {
    // Utilizar los valores predefinidos si se proporcionan
    nestedPuzzle = predefinedPuzzle;
    nestedSolution = predefinedSolution;
    currentSudokuState = JSON.parse(JSON.stringify(nestedPuzzle));
    initialRemainingNumbers = calculateInitialRemainingNumbers(nestedPuzzle);
    createInitialRemainingDivs();
  } else {
    // Generar un nuevo sudoku usando sudoku-gen con la dificultad seleccionada
    const { puzzle: originalPuzzle, solution: solvedPuzzle } =
      getSudoku(difficulty);

    console.log("Sudoku generado:", originalPuzzle); // Mensaje de depuración para el sudoku generado
    nestedPuzzle = [];
    // Convierte el sudoku en formato de matriz para su uso en el juego
    for (let i = 0; i < 9; i++) {
      nestedPuzzle.push(
        originalPuzzle
          .substring(i * 9, (i + 1) * 9)
          .split("")
          .map((cell) => (cell === "-" ? 0 : parseInt(cell)))
      );
    }
    // Limpia el estado actual del sudoku al inicio del juego
    currentSudokuState = JSON.parse(JSON.stringify(nestedPuzzle));
    // Crear los divs de los números restantes solo si no se han calculado previamente
    initialRemainingNumbers = calculateInitialRemainingNumbers(nestedPuzzle);
    createInitialRemainingDivs();

    nestedSolution = [];
    for (let i = 0; i < 9; i++) {
      nestedSolution.push(
        solvedPuzzle
          .substring(i * 9, (i + 1) * 9)
          .split("")
          .map((cell) => (cell === "-" ? 0 : parseInt(cell)))
      );
    }
  }

  console.log("Sudoku resuelto:", nestedSolution);
  console.log("Nested Puzzle:", nestedPuzzle);
  // Calcular los números restantes inicialmente
  calculateInitialRemainingNumbers(nestedPuzzle);

  // Digits 1-9
  for (let i = 1; i <= 9; i++) {
    let number = document.createElement("div");
    number.innerText = i;
    number.dataset.number = i; // Añadir el atributo de datos
    number.addEventListener("click", selectDigit);
    number.classList.add("number");

    document.getElementById("digits").appendChild(number);
  }
  // Board 9x9
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      let tile = document.createElement("div");
      tile.id = r.toString() + "-" + c.toString();
      if (nestedPuzzle[r][c] !== 0) {
        // Comprueba si el valor no es cero
        tile.innerText = nestedPuzzle[r][c];
        tile.classList.add("tile-start");

        // Incrementar el conteo del número colocado en el tablero inicial
        const number = nestedPuzzle[r][c];
        numberCount[number - 1]++;
      }
      //Crear lineas horizontales y verticales para separar el tablero
      if (r == 2 || r == 5) {
        tile.classList.add("horizontal-line");
      }
      if (r == 0 || r == 1 || r == 3 || r == 4 || r == 6 || r == 7) {
        tile.classList.add("horizontal-grid");
      }
      if (c == 2 || c == 5) {
        tile.classList.add("vertical-line");
      }
      if (c == 0 || c == 1 || c == 3 || c == 4 || c == 6 || c == 7) {
        tile.classList.add("vertical-grid");
      }
      tile.addEventListener("click", selectTile);
      tile.classList.add("tile");
      document.getElementById("board").append(tile);
    }
  }
  // Establecer la solución en el alcance global
  solution = nestedSolution;
  // Modificar el texto del div con id "difficulty" según la dificultad seleccionada
  document.getElementById("difficulty").textContent =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function checkSolution() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const tile = document.getElementById(`${r}-${c}`);
      if (
        tile.classList.contains("user-input") ||
        tile.classList.contains("tile-start")
      ) {
        // Verificar si el texto en el tile no es igual a la solución
        if (tile.innerText !== solution[r][c].toString()) {
          return false; // Si alguna celda no coincide, devuelve falso
        }
      } else if (
        tile.innerText.trim() !== "" ||
        !tile.querySelector(".candidate")
      ) {
        // Si el texto en el tile no está vacío y no contiene candidatos
        return false;
      }
    }
  }
  console.log("El sudoku esta resuelto");
  return true; // Si todas las celdas coinciden o están vacías, devuelve verdadero
}

// Obtener los botones de dificultad y agregar evento de clic
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    difficulty = button.getAttribute("data-difficulty");
    // Llamar a setGame con la dificultad seleccionada
    setGame();
    // Ocultar el modal después de seleccionar la dificultad
    document.getElementById("start-modal").style.display = "none";
  });
});

// Mostrar el modal al cargar la página
window.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById("start-modal").style.display = "block";
  document.getElementById("timer").innerText = "00:00";
  stopTimer();
});

// Agregar evento de teclado para seleccionar el número o moverse por el tablero
document.addEventListener("keydown", (event) => {
  const key = event.key;
  const selectedTile = tileSelected;
  if (IsOver) {
    return; // No hacer nada si el juego ha terminado
  }
  switch (key) {
    case "ArrowUp":
      moveSelection(-1, 0, selectedTile);
      break;
    case "ArrowDown":
      moveSelection(1, 0, selectedTile);
      break;
    case "ArrowLeft":
      moveSelection(0, -1, selectedTile);
      break;
    case "ArrowRight":
      moveSelection(0, 1, selectedTile);
      break;
    default:
      if (!isNaN(key) && key !== " ") {
        const digit = parseInt(key);
        if (digit >= 1 && digit <= 9) {
          if (numberCount[digit - 1] >= 9) {
            console.log(`Colocado 9 veces el numero ${digit}`);
            return; // No hacer nada si el número ya se ha colocado 9 veces
          }
          // Llamar a selectTile con el número presionado
          console.log("el digito es: ", digit);
          console.log("Llamando a selectTile desde el evento de teclado");
          selectTile(null, digit);
        }
      }
  }
});

// Función para mover la selección por el tablero
function moveSelection(rowOffset, colOffset, selectedTile) {
  const currentRow = selectedCell.row;
  const currentCol = selectedCell.col;
  const newRow = Math.max(0, Math.min(8, currentRow + rowOffset)); // Limitar el movimiento dentro del tablero
  const newCol = Math.max(0, Math.min(8, currentCol + colOffset)); // Limitar el movimiento dentro del tablero
  const newCellId = `${newRow}-${newCol}`;
  try {
    const newCell = document.getElementById(newCellId);
    if (newCell) {
      clearHighlights();
      clearHighlightsCandidates();
      // Seleccionar nueva celda
      selectedCell = { row: newRow, col: newCol };
      tileSelected = newCell;
      newCell.classList.add("highlighted");
      // Verificar si la celda seleccionada tiene la clase tile-start o user-input
      const isUserInputOrTileStart =
        tileSelected.classList.contains("user-input") ||
        tileSelected.classList.contains("tile-start");

      if (isUserInputOrTileStart) {
        // Si la celda seleccionada tiene la clase tile-start o user-input, resaltar números iguales al número seleccionado
        const selectedNumber = parseInt(tileSelected.innerText);
        highlightCells(selectedNumber);
        highlightRelatedCells(newRow, newCol);
      } else {
        // Luego, llamar a la función para resaltar las celdas relacionadas
        highlightRelatedCells(newRow, newCol);
      }
    }
  } catch (error) {
    console.error("Error al seleccionar la celda:", error.message);
  }
}

// region selectTile
function selectTile(event, digit) {
  // Limpiar cualquier resaltado anterior
  clearHighlights();
  clearHighlightsCandidates();
  let tile;
  if (event) {
    tile = event.target;
    // Verificar si el clic se realizó en un elemento con la clase 'grid-container' o en un <span> con la clase 'candidate'
    if (
      tile.classList.contains("grid-container") ||
      tile.classList.contains("candidate")
    ) {
      console.log("El clic se realizó en un grid-container o un candidato");
      tile = tile.closest(".tile"); // Obtener el elemento 'tile' más cercano
    }
  } else {
    tile = tileSelected;
  }

  if (!tile) {
    return; // Salir de la función si tile es null
  }

  let coords = tile.id.split("-");
  let r = parseInt(coords[0]);
  let c = parseInt(coords[1]);
  // Almacenar la celda seleccionada
  selectedCell = { row: r, col: c };
  console.log("R=", r, "C=", c);

  // Resaltar la celda seleccionada
  tileSelected = tile;
  tileSelected.classList.add("highlighted");
  // Llamar a la función para resaltar las celdas relacionadas
  highlightRelatedCells(r, c);
  // Verificar si la celda seleccionada tiene la clase tile-start o user-input
  const isEmptyTile =
    tileSelected.classList.contains("user-input") ||
    tileSelected.classList.contains("tile-start");

  if (isEmptyTile) {
    // Si la celda seleccionada tiene la clase tile-start o user-input, resaltar números iguales al número seleccionado
    const selectedNumber = digit || parseInt(tileSelected.innerText);
    highlightCells(selectedNumber);
    highlightRelatedCells(r, c);
  }

  // Verificar si hay un número seleccionado
  if (!isEmptyTile && digit) {
    console.log("El primer if se ha ejecutado correctamente.");

    if (
      tileSelected.innerText === "" ||
      tileSelected.querySelectorAll(".candidate").length > 0
    ) {
      console.log("El segundo if se ha ejecutado correctamente.");

      console.log("Valor de solution en la celda:", solution[r][c]);
      console.log(`El número seleccionado es ${digit}.`);

      if (candiPressed) {
        handleManualCandidateInsertion(selectedCell, digit); // Llamar a la función para manejar la inserción manual de candidatos
        return; // Salir de la función después de manejar la inserción manual de candidatos
      } else {
        if (solution && solution[r] && solution[r][c] === digit) {
          if (isNumberAvailable(digit)) {
            tileSelected.innerText = digit;
            console.log(
              `El número ${digit} ha sido colocado en la celda ${r}-${c}.`
            );
            tileSelected.classList.add("user-input");

            tileSelected
              .querySelectorAll(".candidate")
              .forEach((candidate) => candidate.remove());

            currentSudokuState[r][c] = digit;

            numberCount[digit - 1]++;

            console.log(
              `Número ${digit} ha sido colocado ${
                numberCount[digit - 1]
              } veces.`
            );

            if (!isNumberAvailable(digit)) {
              disableNumberSelection(digit);
              numSelected = null;
            }

            if (pencilPressed) {
              const allCandidates = getAllCandidates(currentSudokuState);
              insertCandidatesIntoTiles(allCandidates);
            }

            highlightCells(digit);
            createRemainingDivs();
            highlightRelatedCells(r, c);
          } else {
            errors += 1;
            document.getElementById(
              "errors"
            ).innerText = `Mistakes: ${errors}/${totalMistakes}`;
            if (errors >= totalMistakes) {
              stopTimer();
              gameOver();
            }
          }

          if (checkSolution()) {
            stopTimer();
            showCongratulations(errors);
          }
        } else {
          errors += 1;
          document.getElementById(
            "errors"
          ).innerText = `Mistakes: ${errors}/${totalMistakes}`;
          if (errors >= totalMistakes) {
            stopTimer();
            gameOver();
          }
        }
      }
    }
  }
}

// region Resaltar Celdas
// Función para resaltar el cuadrado de 3x3 de celdas, así como las líneas verticales y horizontales
function highlightRelatedCells(r, c) {
  // Resaltar el cuadrado de 3x3 de celdas donde se encuentra el número seleccionado
  const rowIndex = Math.floor(r / 3) * 3; // Índice de la fila del cuadrado
  const colIndex = Math.floor(c / 3) * 3; // Índice de la columna del cuadrado
  for (let i = rowIndex; i < rowIndex + 3; i++) {
    for (let j = colIndex; j < colIndex + 3; j++) {
      const cell = document.getElementById(`${i}-${j}`);
      cell.classList.add("highlighted-square");
    }
  }

  // Resaltar las líneas verticales y horizontales donde se encuentra el número seleccionado
  for (let i = 0; i < 9; i++) {
    const cellHorizontal = document.getElementById(`${i}-${c}`);
    cellHorizontal.classList.add("highlighted-line");
    const cellVertical = document.getElementById(`${r}-${i}`);
    cellVertical.classList.add("highlighted-line");
  }
}

function highlightCells(selectedNumber) {
  // Limpiar cualquier resaltado anterior
  clearHighlightsCandidates();

  // Resaltar las celdas con el mismo número que la celda seleccionada y que sean tile-start o user-input
  const cells = document.querySelectorAll("#board > div.tile");
  cells.forEach((cell) => {
    if (
      cell.innerText === selectedNumber.toString() &&
      (cell.classList.contains("tile-start") ||
        cell.classList.contains("user-input"))
    ) {
      cell.classList.add("highlighted");
      cell.style.backgroundColor = "rgb(64, 89, 126)"; // Cambiar el color de fondo
    }
  });

  // Resaltar los candidatos en otros tiles que contienen el mismo número
  const candidates = document.querySelectorAll(".candidate");
  candidates.forEach((candidate) => {
    if (candidate.innerText === selectedNumber.toString()) {
      candidate.classList.add("highlighted-candidate");
    }
  });
}

function clearHighlightsCandidates() {
  // Eliminar el resaltado de las celdas y los candidatos
  const highlightedItems = document.querySelectorAll(
    ".highlighted, .highlighted-candidate"
  );
  highlightedItems.forEach((item) => {
    item.classList.remove("highlighted", "highlighted-candidate");
    item.style.backgroundColor = ""; // Restaurar el color de fondo original
  });
}
// region Congratulations
function showCongratulations(errors) {
  pencilPressed = false;
  // Obtener una referencia al contenedor del tablero
  const boardContainer = document.getElementById("board");

  // Crear un div para el contenedor del cuadro de diálogo
  const dialogContainer = document.createElement("div");
  dialogContainer.classList.add("dialog-container");
  // Agregar el dialogContainer al final del body
  document.body.appendChild(dialogContainer);

  // Crear un div para la ventana de felicitación
  const congratulationsBox = document.createElement("div");
  congratulationsBox.classList.add("dialog-box");
  congratulationsBox.id = "congratulations-message";
  dialogContainer.appendChild(congratulationsBox);

  // Crear div para las estrellas
  const starsContainer = document.createElement("div");
  starsContainer.classList.add("stars-container");
  congratulationsBox.appendChild(starsContainer);

  // Añadir las imágenes de las estrellas
  for (let i = 0; i < 3; i++) {
    const starImage = document.createElement("img");
    starImage.src = "./assets/star-empty.png"; // Añade la ruta correcta a la imagen de estrella vacía
    starImage.classList.add("star");
    starsContainer.appendChild(starImage);
  }

  // Modificar las estrellas según los errores
  const stars = starsContainer.querySelectorAll(".star");

  if (errors === 0) {
    stars.forEach((star) => {
      star.src = "./assets/star.png";
    });
  } else if (errors === 1) {
    stars[0].src = "./assets/star.png";
    stars[1].src = "./assets/star.png";
  } else if (errors === 2) {
    stars[0].src = "./assets/star.png";
  }

  // Crear un mensaje de felicitación
  const congratulationsText = document.createElement("div");
  const elapsedTime = document.getElementById("timer").innerText; // Obtener el tiempo del temporizador
  congratulationsText.innerHTML = `
    <div class="congratulations-title">¡Congratulations!</div>
    <div class="congratulations-details">
<p><span class="label">Time:</span> ${elapsedTime}</p>
  <p><span class="label">Difficulty:</span> ${
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  }</p>
  <p><span class="label">Mistakes:</span> ${errors}/3</p>
    </div>
  `;
  congratulationsText.classList.add("congratulations-text");
  congratulationsBox.appendChild(congratulationsText);

  // Crear un botón para iniciar un nuevo juego
  const newGameButton = document.createElement("button");
  newGameButton.textContent = "New Game";
  newGameButton.classList.add("new-game-button");
  newGameButton.addEventListener("click", () => {
    restartGame();
    document.getElementById("start-modal").style.display = "block"; // Mostrar modal de selección de dificultad
    document.getElementById("timer").innerText = "00:00";
    stopTimer();
    dialogContainer.remove();
  });
  congratulationsBox.appendChild(newGameButton);

  // Crear un botón de reinicio
  const restartButton = document.createElement("button");
  restartButton.textContent = "Replay Game";
  restartButton.classList.add("restart-button");
  restartButton.addEventListener("click", () => {
    document.getElementById("timer").innerText = "00:00"; // Reiniciar el temporizador
    stopTimer(); // Detener el temporizador si está en marcha
    clearHighlights();
    replayGame(nestedPuzzle, nestedSolution); // Volver a cargar el mismo sudoku
    congratulationsBox.remove(); // Ocultar ventana de diálogo
    dialogContainer.remove();
  });
  congratulationsBox.appendChild(restartButton);

  // Agregar la ventana de felicitación al contenedor del tablero
  boardContainer.appendChild(congratulationsBox);
}

//region GameOver
function gameOver() {
  // Obtener una referencia al contenedor del tablero
  const boardContainer = document.getElementById("board");

  const tiles = document.querySelectorAll("#board .tile");
  tiles.forEach((tile) => {
    tile.removeEventListener("click", selectTile);
  });

  // Obtener una referencia a todos los números del div digits
  const digitsContainer = document.getElementById("digits");
  digitsContainer.style.cursor = "default";
  const digitNumbers = document.querySelectorAll("#digits > div");
  const remainingNumbers = document.querySelectorAll(
    "#remaining-container > div"
  );

  // Agregar la clase "unavailable" a cada número del div digits
  digitNumbers.forEach((number) => {
    number.classList.add("unavailable");
    number.style.cursor = "default";
  });
  remainingNumbers.forEach((element) => {
    element.classList.add("unavailable");
  });

  // Establecer el estado de juego como terminado
  IsOver = true;

  // Crear un div para el contenedor del cuadro de diálogo
  const dialogContainer = document.createElement("div");
  dialogContainer.classList.add("dialog-container");
  // Agregar el dialogContainer al final del body
  document.body.appendChild(dialogContainer);

  // Crear un div para el cuadro de diálogo
  const dialogBox = document.createElement("div");
  dialogBox.classList.add("dialog-box");
  dialogBox.id = "game-over-message";
  // Agregar el dialogBox al dialogContainer
  dialogContainer.appendChild(dialogBox);

  // Crear div para las imagenes gameOver
  const overContainer = document.createElement("div");
  overContainer.classList.add("over-container");
  dialogBox.appendChild(overContainer);

  // Añadir las imágenes de gameOver
  for (let i = 0; i < 3; i++) {
    const overImage = document.createElement("img");
    overImage.src = "./assets/game-over2.png"; // Añade la ruta correcta a la imagen de estrella vacía
    overImage.classList.add("over");
    overContainer.appendChild(overImage);
  }
  // Modificar las estrellas según los errores
  const gameOverImg = overContainer.querySelectorAll(".over");
  gameOverImg.forEach((ggOver) => {
    ggOver.src = "./assets/game-over2.png";
  });

  // Crear un elemento para mostrar "GAME OVER"
  const gameOverText = document.createElement("div");
  gameOverText.innerHTML = `
    <div class="gameOver-title">GAME OVER</div>
  <p>You can start a new game or replay the same game</p>
  `;
  gameOverText.classList.add("game-over-text");
  dialogBox.appendChild(gameOverText);

  // Crear un botón de nuevo juego
  const newGameButton = document.createElement("button");
  newGameButton.textContent = "New Game";
  newGameButton.classList.add("new-game-button");
  newGameButton.addEventListener("click", () => {
    restartGame();
    document.getElementById("start-modal").style.display = "block"; // Mostrar modal de selección de dificultad
    document.getElementById("timer").innerText = "00:00";
    stopTimer();
    dialogBox.remove(); // Ocultar ventana de diálogo
    dialogContainer.remove();
  });
  dialogBox.appendChild(newGameButton);

  // Crear un botón de reinicio
  const restartButton = document.createElement("button");
  restartButton.textContent = "Replay Game";
  restartButton.classList.add("restart-button");
  restartButton.addEventListener("click", () => {
    document.getElementById("timer").innerText = "00:00"; // Reiniciar el temporizador
    stopTimer(); // Detener el temporizador si está en marcha
    clearHighlights();
    replayGame(nestedPuzzle, nestedSolution); // Volver a cargar el mismo sudoku
    dialogBox.remove(); // Ocultar ventana de diálogo
    dialogContainer.remove();
  });
  dialogBox.appendChild(restartButton);

  // Agregar el cuadro de diálogo al contenedor del tablero
  boardContainer.appendChild(dialogBox);
}

function replayGame(predefinedPuzzle, predefinedSolution) {
  // Reiniciar el juego
  errors = 0;
  IsOver = false;
  pencilPressed = false;
  currentSudokuState = [];
  nestedPuzzle = predefinedPuzzle;
  nestedSolution = predefinedSolution;
  document.getElementById("errors").innerText = "Mistakes: 0/3";
  // Restablecer estado del lápiz rápido y restaurar el color original del texto del span

  // Eliminar la clase "pressed" de todas las imágenes
  document.querySelectorAll("img.pressed").forEach((img) => {
    img.classList.remove("pressed");
  });

  document.querySelectorAll("span").forEach((span) => {
    span.style.color = ""; // Restablecer color original
  });
  clearGame(); // Limpiar el tablero anterior y la interfaz de usuario
  setGame(predefinedPuzzle, predefinedSolution); // Configurar un nuevo juego
}

function restartGame() {
  // Reiniciar el juego
  errors = 0;
  IsOver = false;
  document.getElementById("errors").innerText = "Mistakes: 0/3";
  // Restablecer estado del lápiz rápido y restaurar el color original del texto del span
  pencilPressed = false;
  // Eliminar la clase "pressed" de todas las imágenes
  document.querySelectorAll("img.pressed").forEach((img) => {
    img.classList.remove("pressed");
  });

  document.querySelectorAll("span").forEach((span) => {
    span.style.color = ""; // Restablecer color original
  });
  clearGame(); // Limpiar el tablero anterior y la interfaz de usuario
  // setGame(); // Configurar un nuevo juego
}

function clearGame() {
  // Limpiar el tablero eliminando todos los elementos hijos
  const board = document.getElementById("board");
  while (board.firstChild) {
    board.removeChild(board.firstChild);
  }

  // Limpiar el mensaje de "GAME OVER" y el botón de reinicio
  const gameOverMessage = document.getElementById("game-over-message");
  if (gameOverMessage) {
    gameOverMessage.remove();
  }

  const congratsMessage = document.getElementById("congratulations-message");
  if (congratsMessage) {
    congratsMessage.remove();
  }

  // Limpiar los dígitos debajo del tablero
  const digits = document.getElementById("digits");
  if (digits) {
    digits.innerHTML = "";
  }
}

// Agregar evento de clic a cada dígito
const digitButtons = document.querySelectorAll("#digits > div");
digitButtons.forEach((button) => {
  button.addEventListener("click", selectDigit);
});

// Variable para almacenar el dígito seleccionado anteriormente
let previousSelectedNumber = null;

// Función para verificar la disponibilidad de un número
function isNumberAvailable(number) {
  return numberCount[number - 1] < 9;
}

// Función para desactivar la selección de un número y cambiar el estilo
function disableNumberSelection(number) {
  const numberElement = document.querySelector(
    `#digits [data-number="${number}"]`
  );
  if (numberElement) {
    numberElement.classList.add("unavailable");
    numberElement.removeEventListener("click", selectDigit); // Desactivar el evento de clic

    // Contar cuántas veces se ha seleccionado el número
    const selectedCount = numberCount[number - 1];

    // DESACTIVAR TILE DEL NÚMERO SI SE HA SELECCIONADO 9 VECES
    // Si se ha seleccionado el número 9 veces, hacer que el tile del número sea invisible
    // if (selectedCount === 9) {
    //   const tile = document.querySelector(`#board [data-number="${number}"]`);
    //   if (tile) {
    //     // tile.style.visibility = "hidden"; // Hacer que el elemento del DOM sea invisible
    //     // tile.removeEventListener("click", selectTile); // Desactivar el evento de clic en el tile
    //     // numberElement.removeEventListener("click", selectDigit);
    //   } else {
    //     console.log(`El tile para el número ${number} no se encontró.`);
    //   }
    // }

    // Deshabilitar la selección del número si se ha seleccionado 9 veces
  }
}

// region selectDigit
function selectDigit(event) {
  // Obtener el número seleccionado del atributo de datos
  const selectedNumber = parseInt(event.target.dataset.number);

  // Verificar si el número seleccionado es el mismo que el número anteriormente seleccionado
  if (numSelected && parseInt(numSelected.innerText) === selectedNumber) {
    // Deseleccionar el número y limpiar los resaltados
    numSelected.style.backgroundColor = ""; // Restaurar el color de fondo predeterminado
    clearHighlights();
    numSelected = null; // Establecer numSelected a null para indicar que ningún número está seleccionado
    return; // Salir de la función
  }

  // Limpiar cualquier resaltado anterior de números con el dígito anteriormente seleccionado
  if (previousSelectedNumber !== null) {
    clearPreviousNumberSelection(previousSelectedNumber);
  }

  // Limpiar cualquier resaltado anterior
  clearHighlights();

  // Resaltar las celdas que contienen el número seleccionado
  const cells = document.querySelectorAll("#board > div.tile");
  cells.forEach((cell) => {
    if (cell.innerText === selectedNumber.toString()) {
      cell.classList.add("highlighted");
      cell.style.backgroundColor = "rgb(64, 89, 126)"; // Cambiar el color de fondo
    }
  });

  // Actualizar el dígito seleccionado anteriormente
  previousSelectedNumber = selectedNumber;

  // Verificar la disponibilidad del número y desactivar la selección si es necesario
  if (!isNumberAvailable(selectedNumber)) {
    disableNumberSelection(selectedNumber);
    return; // Salir de la función si el número no está disponible
  }
  // Llamar a selectTile con el número seleccionado como argumento
  selectTile(null, selectedNumber);
}

function clearPreviousNumberSelection(number) {
  // Limpiar cualquier resaltado anterior de números con el dígito especificado
  const cells = document.querySelectorAll("#board > div.tile");
  cells.forEach((cell) => {
    if (cell.innerText === number) {
      cell.classList.remove("highlighted");
      cell.style.backgroundColor = ""; // Restaurar el color de fondo predeterminado
    }
  });
}

function clearHighlights() {
  // Obtener todos los elementos tile del tablero
  const tiles = document.querySelectorAll("#board > div.tile");

  // Iterar sobre cada elemento tile y remover todas las clases de resaltado
  tiles.forEach((tile) => {
    tile.classList.remove("highlighted");
    tile.style.backgroundColor = ""; // Restaurar el color de fondo predeterminado
    tile.classList.remove("highlighted-line");
    tile.classList.remove("highlighted-square");
  });
}

let timerInterval; // Variable global para almacenar el intervalo del temporizador
let startTime; // Variable para almacenar el tiempo de inicio del juego

// Función para iniciar el temporizador
function startTimer() {
  let elapsedTime = 0;
  startTime = Date.now(); // Obtener el tiempo actual en milisegundos

  // Actualizar el tiempo en el reloj cada segundo
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime; // Calcular el tiempo transcurrido
    updateTimer(elapsedTime); // Actualizar el tiempo en el reloj
  }, 1000);
}

// Función para detener el temporizador
function stopTimer() {
  clearInterval(timerInterval); // Detener el intervalo del temporizador
}

// Función para actualizar el tiempo en el reloj
function updateTimer(elapsedTime) {
  const minutes = Math.floor(elapsedTime / 60000); // Calcular minutos
  const seconds = Math.floor((elapsedTime % 60000) / 1000); // Calcular segundos
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`; // Formatear el tiempo como MM:SS
  document.getElementById("timer").innerText = formattedTime; // Actualizar el texto del reloj
}
