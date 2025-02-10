const boardObject = document.querySelector('.board');
let player1turn = true;
let needsToContinueLeaping = false;
let pieceThatNeedsToLeapAgain = null;
let originCell = null;
let targetCell = null;
let leapCell = null;
let thisPieceMovedNowRow = null;
let thisPieceMovedNowCol = null;
let leapMadeThisTurn = false;
let indexOfPossibleleaping = [];
const cells = document.getElementsByClassName('cell');

class CellinArray {
  constructor(isPiece = false, isPieceWhite = false, isPieceMarked = false, isPieceKing = false, isBlackCellMarked = false) {
    this.isBlackCellMarked = isBlackCellMarked; // האם המשבצת השחורה מסומנת
    this.isPiece = isPiece; // האם יש כלי במשבצת
    this.isPieceWhite = isPieceWhite; // האם הכלי לבן
    this.isPieceMarked = isPieceMarked; // האם הכלי מסומן (נבחר)
    this.isPieceKing = isPieceKing; // האם הכלי הוא מלך
  }
}

function createDraw() {
  const drawButton = document.getElementById('drawButton');
  const drawModal = document.getElementById('drawModal');
  const confirmDraw = document.getElementById('confirmDraw');
  const cancelDraw = document.getElementById('cancelDraw');
  const drawMessage = document.getElementById('drawMessage');
  drawButton.addEventListener('click', () => {
    const opponent = !player1turn ? "Player 2" : "Player 1";
    drawMessage.textContent = `${opponent} is offering you a draw, do you agree?`;
    drawModal.style.display = 'block';
  });
  confirmDraw.addEventListener('click', () => {
    drawMessage.textContent = "The game is over. Agreed draw.";
    confirmDraw.style.display = 'none';
    cancelDraw.style.display = 'none';
    reloadPage();
  });
  cancelDraw.addEventListener('click', () => {
    drawModal.style.display = 'none';
  });
  window.addEventListener('click', (event) => {
    if (event.target == drawModal) {
      drawModal.style.display = 'none';}
  });
}
createDraw();

const resignButton = document.getElementById('resignButton');
const resignModal = document.getElementById('resignModal');
const confirmResign = document.getElementById('confirmResign');
const cancelResign = document.getElementById('cancelResign');
const resignMessage = document.getElementById('resignMessage');

function creatResign(){
  resignButton.addEventListener('click', () => {
    resignModal.style.display = 'block';
  });
  confirmResign.addEventListener('click', () => {
    confirmResign.style.display = 'none';
    cancelResign.style.display = 'none';
    const winner = player1turn ? "Player 2" : "Player 1";
    resignMessage.textContent = `${winner} won the game!`
    reloadPage();
  });
  cancelResign.addEventListener('click', () => {
    resignModal.style.display = 'none';
  });
  window.addEventListener('click', (event) => {
    if (event.target == resignModal) {
      resignModal.style.display = 'none';
    }
  });  
}
creatResign();

function setArrayBoard() {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  const blackPiecesPositions = [1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23];
  const whitePiecesPositions = [40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const index = convertAxesToIndex(row, col)
      if ((row + col) % 2 !== 0) {  // בדיקה האם המשבצת שחורה
        if (blackPiecesPositions.includes(index))
          board[row][col] = new CellinArray(true, false, false, false, false);
        else if (whitePiecesPositions.includes(index))
          board[row][col] = new CellinArray(true, true, false, false, false); 
        else
          board[row][col] = new CellinArray(false, false, false, false, false); 
      }
      else
        board[row][col] = 0;
    }
  }
  return board;
}

const board = setArrayBoard();
visualizeBoard();

const onesMessage = document.getElementById('one-turn-text')
const twosMessage = document.getElementById('two-turn-text')
function changeTurn(){
    activeMessage = player1turn ? twosMessage : onesMessage;
    inactiveMessage = player1turn ? onesMessage : twosMessage;
    activeMessage.classList.add('blacktext');
    activeMessage.classList.remove('graytext');
    inactiveMessage.classList.add('graytext');
    inactiveMessage.classList.remove('blacktext');
    player1turn = !player1turn;
}

function visualizeBoard(){
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.addEventListener('dragover', dragover);
      cell.addEventListener('drop', dragDrop);
      if (board[row][col] == 0)
        cell.classList.add('whitecell');
      else{
        cell.classList.add('blackcell');
        if(board[row][col].isBlackCellMarked === true)
          cell.classList.add('allowed-move');       
      }
      cell.dataset.row = row;
      cell.dataset.column = col;
      boardObject.appendChild(cell);
      if (board[row][col] !== null && board[row][col].isPiece === true){
        const piece = createPieceElement(row, col);
        cell.appendChild(piece);
        cell.setAttribute('draggable', false);
      }      
    }
  }
}

let draggedElement;

function dragstart (event){
  event.stopPropagation();
  draggedElement = event.target; // רק הכלי נגרר
  const clone = draggedElement.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.opacity = "0.2"; // כדי שיהיה חצי שקוף

  document.body.appendChild(clone);
  event.dataTransfer.setDragImage(clone, 20, 20);

  setTimeout(() => document.body.removeChild(clone), 0); // מוחק את התמונה מיד
  
  if (needsToContinueLeaping == false)
    playGame(event);
}

function dragover(event){
  event.preventDefault()
}
function dragDrop(event){
  if (needsToContinueLeaping == false)
    playGame(event);
  else
    turnOfContinueLeaping(event);
}

function createPieceElement(row, col) {
  const piece = document.createElement('div');
  if (board[row][col].isPieceWhite){
    piece.classList.add('white-piece');
    if (board[row][col].isPieceKing)
      piece.classList.add('king-white-piece');           
  }
  else {
    piece.classList.add('black-piece');
    if (board[row][col].isPieceKing)
      piece.classList.add('king-black-piece'); 
  }
  if (board[row][col].isPieceMarked === true)
    piece.classList.add('selected-piece');
  
  piece.setAttribute('draggable', true);
  piece.addEventListener('dragstart', dragstart);
  return piece;
}

function clearBoard() {
  const boardElement = document.getElementById('board');
  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }
}

function renderBoard() {
  clearBoard();
  visualizeBoard();
}

function playGame(event) {
  let row, col, cell;
  if (originCell === null) {
      row = parseInt(event.target.parentNode.dataset.row);
      col = parseInt(event.target.parentNode.dataset.column);
      cell = event.target.parentNode;
      if (handleFirstClick(row, col) === false) return; // טיפול בבחירה לא חוקית
  } else {
      cell = event.currentTarget;
      row = parseInt(cell.dataset.row);
      col = parseInt(cell.dataset.column);
      let indexesOfPiecesThatMustLeap = findPiecesThatMustLeap();
      handleSecondClickAndEndTurn(row, col, indexesOfPiecesThatMustLeap);
  }
}

function handleFirstClick(row, col) {
  if (!isValidPieceSelection(row, col)) return false; // החזרה של false אם הבחירה לא חוקית
  originCell = {row, col};
  originRow = row;
  originCol = col;
  originIndex = convertAxesToIndex(originRow, originCol);
  board[row][col].isPieceMarked = true;
  CheckAndhighlightAllowedMoves(originRow, originCol);
  return true; // החזרה של true אם הבחירה חוקית וטופלה
}

function handleSecondClickAndEndTurn(row, col, indexesOfPiecesThatMustLeap) {
  handleSecondClick(row, col); // קריאה לפונקציה המקורית
  if (targetCell !== null && originCell !== null) {
      if (isMoveValid(originRow, originCol, targetCell.row, targetCell.col) === true) {
          const originIndex = convertAxesToIndex(originCell.row, originCell.col);
          const targetIndex = convertAxesToIndex(targetCell.row, targetCell.col);
          if (indexesOfPiecesThatMustLeap.includes(originIndex)) {
              indexesOfPiecesThatMustLeap.push(targetIndex);
          }
          if (board[originCell.row][originCell.col].isPiece === true) {
              executeMove(originCell, targetCell);
          }
          if (targetCell.row == 0 || targetCell.row == 7)
              kingAPiece(targetCell.row, targetCell.col);
          lastPartsOfTurn(indexesOfPiecesThatMustLeap);
      } else {
          alert('move not legal. try again');
          originCell = null;
          targetCell = null;
      }
      removeAlowedMoves();
      renderBoard();
  }
}

function isValidPieceSelection(row, col) {
  const opponentIsWhite = player1turn ? false : true;

  if (board[row][col].isPiece === false || board[row][col] == 0) {
      alert('That spot is empty! Choose a piece.');
      return false;
  }
  if (board[row][col].isPieceWhite === opponentIsWhite) {
      alert('You are trying to move the opponent’s piece. Try again.');
      return false;
  }
  return true;
}

function executeMove() {
  copyPieceToNewCell(originCell.row, originCell.col, targetCell.row, targetCell.col);
  erasePieceFromCell(originCell.row, originCell.col);
  if (leapCell !== null)
  {
    erasePieceFromCell(leapCell.leapRow, leapCell.leapcol);
    leapCell = null;
    leapMadeThisTurn = true;
    if (canThisPieceLeapAgain(targetCell.row, targetCell.col) === true)
     { 
        board[targetCell.row][targetCell.col].isPieceMarked = true;
        needsToContinueLeaping = true;
        pieceThatNeedsToLeapAgain = targetCell;
     } 
  }
}

function handleSecondClick(row, col){
  if (board[row][col].isPiece === true) {
      if(row === originCell.row && col === originCell.col)
        alert('you clicked the same spot twice')
      else
        alert('that spot is not empty! your destanation has to be empty')
      board[originCell.row][originCell.col].isPieceMarked = false;
      originCell = null;
      removeAlowedMoves(); //צריך טיפול בהמשך
      renderBoard();
      return;
    } 
    targetCell = {row, col};
    board[originCell.row][originCell.col].isPieceMarked = false;
}

function lastPartsOfTurn(indexesOfPiecesThatMustLeap){
  thisPieceMovedNowRow = targetCell.row;
  thisPieceMovedNowCol = targetCell.col;
  originCell = null;  //restart the storage objects
  targetCell = null;
  if (needsToContinueLeaping === false)
  {
    burnPieces(indexesOfPiecesThatMustLeap); 
    changeTurn(); 
    leapMadeThisTurn = false;
    if (doesPlayerHaveLegalMove() === false)
      {
          const winner = player1turn ? "Player 2" : "Player 1";
          drawMessage.textContent = `${winner} won the game!`;
          drawModal.style.display = 'block';
          cancelDraw.style.display = 'none';
          confirmDraw.style.display = 'none';
          reloadPage();
      }
  } 
}

function convertToRowCol(index) {
  if (index < 0 || index >= 64) {
    return
  }
  const row = Math.floor(index / 8);
  const col = index % 8;
  return { row, col };
}

function erasePieceFromCell (row, col) {
  board[row][col].isPiece = false;
  board[row][col].isPieceMarked = false;
  board[row][col].isPieceKing = false;
  board[row][col].isPieceWhite = false;
}

function copyPieceToNewCell(row1, col1, row2, col2){
  board[row2][col2].isPiece = true;
  board[row2][col2].isPieceMarked = board[row1][col1].isPieceMarked;
  board[row2][col2].isPieceKing = board[row1][col1].isPieceKing;
  board[row2][col2].isPieceWhite = board[row1][col1].isPieceWhite;
}

function isMoveValid(originRow, originCol, targetRow, targetCol) {
  const direction = player1turn ? -1 : 1; // לבן נע מ7 ל0, שחור בכיוון ההפוך
  const originIndex = convertAxesToIndex(originRow, originCol);
  const targetIndex = convertAxesToIndex(targetRow, targetCol);
  if (originIndex < 0 || originIndex >= 64 
    || targetIndex < 0 || targetIndex >= 64) 
  { return false; }
  if (board[originRow][originCol] === null || board[targetRow][targetCol] === null)
    {return false;}

  if (board[originRow][originCol].isPieceKing)
    return isKingMoveValid(originRow, originCol, targetRow, targetCol);
  
  if (parseInt(originRow) === parseInt(targetRow) - direction
      && (parseInt(originCol) === parseInt(targetCol) -1 
      || parseInt(originCol) === parseInt(targetCol) + 1))
      {return true; }
  
  if ((parseInt(originRow) === parseInt(targetRow) - (2 * direction)
    && (parseInt(originCol) === parseInt(targetCol) - 2 
    || parseInt(originCol) === parseInt(targetCol) + 2)) 
    && isOppenentInTheMiddleOfTheLeap (originRow, originCol, targetRow, targetCol) === true)
    { return true; }
  return false;
}   
  
function isOppenentInTheMiddleOfTheLeap (originRow, originCol, targetRow, targetCol)
{
  const leapRow = (parseInt(originRow) + parseInt(targetRow)) / 2;
  const leapcol = (parseInt(originCol) + parseInt(targetCol)) / 2;
  if (board[leapRow][leapcol].isPiece === false)
    return false;
  else {
    const opponentIsWhite = player1turn ? false : true;
    if (board[leapRow][leapcol].isPieceWhite == opponentIsWhite) {
        leapCell = {leapRow, leapcol};
        return true;      
    }      
    return false;   
  }
}
function kingAPiece(row, col) {
  board[row][col].isPieceKing = true;
}
function isKingMoveValid(originRow, originCol, targetRow, targetCol) {
  const rowDiff = Math.abs(targetRow - originRow);
  const colDiff = Math.abs(targetCol - originCol);
  if (rowDiff !== colDiff || rowDiff == 0 || colDiff == 0) {   // 1. בדיקה לתנועה אלכסונית
    return false; 
  }
  // 2. בדיקה לחסימות
  const rowDirection = parseInt(targetRow) > parseInt(originRow) ? 1 : -1;
  const colDirection = parseInt(targetCol) > parseInt(originCol) ? 1 : -1;
  let currentRow = parseInt(originRow) + rowDirection;
  let currentCol = parseInt(originCol) + colDirection;
  while (currentRow != targetRow) {
    if (board[currentRow][currentCol].isPiece == true) {
      if (board[currentRow][currentCol].isPieceWhite == !player1turn){
        if (Math.abs(currentRow - targetRow) > 1) {
          return false;         // בדיקה למרחק אחרי חסימה
        }
        let leapRow = currentRow;
        let leapcol = currentCol;
        leapCell = {leapRow,leapcol};
      }
      else
        return false;      
    }
    currentRow += rowDirection;
    currentCol += colDirection;
  }
  return true; // תנועה חוקית  
}

function reloadPage() {
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

function convertAxesToIndex(row, col) {
  const wantedIndex = parseInt(row) * 8 + parseInt(col);
  return wantedIndex;
}

function canThisPieceLeapAgain (row, col) {
  let leapFound = false;
  let directionRow = 0;
  let directionCol = 0;
  for (let i = 0; i < 4; i++) {
    switch (i) {
      case 0:  { directionRow = 1;   directionCol = 1;   break;}
      case 1:  { directionRow = 1;  directionCol = -1;  break; }
      case 2:  { directionRow = -1;  directionCol = 1;   break;}
      case 3:  { directionRow = -1;  directionCol = -1;  break;}
    }  
    let targetRow = parseInt(row) + 2 * directionRow;
    let targetCol = parseInt(col) + 2 * directionCol; 
    if (targetRow >= 0 && targetRow <= 7 && targetCol >= 0 && targetCol <= 7) {
      if (board[targetRow][targetCol].isPiece === false) {
        let mdlRow = parseInt(row) + directionRow;
        let mdlCol = parseInt(col) + directionCol;
        if (board[mdlRow][mdlCol].isPiece === true && board[mdlRow][mdlCol].isPieceWhite == !player1turn){
            leapFound = true;
            indexOfPossibleleaping.push(convertAxesToIndex(targetRow, targetCol));
            board[targetRow][targetCol].isBlackCellMarked = true;
          }  
      }
    }
  }
  if (leapFound) {
    alert('you can leap again')
    return true;  
  }
  return false;
}

function turnOfContinueLeaping(event) {
  const originCell = pieceThatNeedsToLeapAgain;
  const targetCell = event.currentTarget;
  const targetRow = parseInt(targetCell.dataset.row);
  const targetCol = parseInt(targetCell.dataset.column);

  const validLeapMade = handleLeap(originCell, targetRow, targetCol);
  finalizeLeap(targetRow, targetCol, validLeapMade);
}

function handleLeap(originCell, targetRow, targetCol) {
  let validLeapMade = false;
  const targetLeapIndex = convertAxesToIndex(targetRow, targetCol);
  const leapOverRow = (parseInt(originCell.row) + targetRow) / 2;
  const leapOvercol = (parseInt(originCell.col) + targetCol) / 2;
  const opponentIsWhite = player1turn ? false : true;

  if (Math.abs(originCell.row - targetRow) === 2 && Math.abs(originCell.col - targetCol) === 2) {
      if (board[targetRow][targetCol].isPiece === false) {
          if (board[leapOverRow][leapOvercol].isPiece === true && board[leapOverRow][leapOvercol].isPieceWhite === opponentIsWhite) {
              validLeapMade = true;
              copyPieceToNewCell(originCell.row, originCell.col, targetRow, targetCol);
              erasePieceFromCell(originCell.row, originCell.col);
              if (targetLeapIndex < 8 || targetLeapIndex > 55)
                  kingAPiece(targetRow, targetCol);
              erasePieceFromCell(leapOverRow, leapOvercol);
              return validLeapMade; // החזרה של סטטוס הלגיטימציה
          }
      }
  }
  return validLeapMade; // החזרה של סטטוס הלגיטימציה
}

function finalizeLeap(targetRow, targetCol, validLeapMade) {
  if (validLeapMade) {
      let row = targetRow;
      let col = targetCol;
      pieceThatNeedsToLeapAgain = { row, col };
      indexOfPossibleleaping.length = 0;
      if (canThisPieceLeapAgain(targetRow, targetCol) === false) {
          needsToContinueLeaping = false;
          pieceThatNeedsToLeapAgain = null;
          indexOfPossibleleaping.length = 0;
          board[targetRow][targetCol].isPieceMarked = false;
          changeTurn();
      }
      removeAlowedMoves();
      renderBoard();
  } else {
      alert('invalid move. you have to continue leaping with the piece');
  }
}

function burnPieces(indexesOfPiecesThatMustLeap) {
  if (leapMadeThisTurn === true) //if player made some capture - none of his pieces should be burned
  {
    indexesOfPiecesThatMustLeap = [];
    return;
  }
  for (let i = 0; i < indexesOfPiecesThatMustLeap.length; i++)
  {
    const indexToCheck = indexesOfPiecesThatMustLeap[i];
    const {row, col} = convertToRowCol(indexToCheck);
    if (board[row][col].isPiece == true)
    {
      erasePieceFromCell(row, col);
      alert('one of your pieces has been burned!');
      return;
    }
  }
  indexesOfPiecesThatMustLeap = [];
}

function findIfKingMustLeap(originRow, originCol) {
  const opponentIsWhite = player1turn ? false : true;
  const directionRows = [1, 1, -1, -1];
  const directionCols = [1, -1, 1, -1];
  let canLeap = false;
  for (let i = 0; i < directionRows.length; i++) {
    let rowIncrement = directionRows[i];
    let colIncrement = directionCols[i];
    while (true) {
      let kingTargetRow = parseInt(originRow) + rowIncrement;
      let kingTargetCol = parseInt(originCol) + colIncrement;
      if (kingTargetRow < 0 || kingTargetRow > 7 || kingTargetCol < 0 || kingTargetCol > 7) {
          break;}
      if (board[kingTargetRow][kingTargetCol].isPiece == true) { 
        if (board[kingTargetRow][kingTargetCol].isPieceWhite == opponentIsWhite) {
          let afterOpponentRow = kingTargetRow + directionRows[i];
          let afterOpponentCol = kingTargetCol + directionCols[i];
          if (afterOpponentRow >= 0 && afterOpponentRow <= 7 && afterOpponentCol >= 0 && afterOpponentCol <= 7) {
            if (board[afterOpponentRow][afterOpponentCol].isPiece == false) {
              canLeap = true;
              break;
            }
          }
        }
        break;
      }
        rowIncrement += directionRows[i];
        colIncrement += directionCols[i];
    }
  }
  return canLeap;
}

function doesPlayerHaveLegalMove () {
  const playertIsWhite = player1turn ? true : false;
  const directionRow = player1turn ? -1 : 1;
  let legalMoveFound = false;
  let anyPiecesFound = false;
  for (let i = 0; i < 8 && legalMoveFound === false; i++) {
    for (let j = 0; j < 8 && legalMoveFound === false; j++) {
      originRow = i;
      originCol = j;
      if (board[i][j].isPiece === true && board[i][j].isPieceWhite == playertIsWhite) {
          anyPiecesFound = true;
          for (let g = 0; g < 64 && legalMoveFound === false; g++) {
            const {row, col} = convertToRowCol(g);
            if (board[row][col].isPiece === false)
              if (isMoveValid(originRow, originCol, row, col) === true)
                legalMoveFound = true;
          }
      }
    }
  }
  if (legalMoveFound === false) {
    const loser = player1turn ? 'player 1' : 'player 2'
    if (anyPiecesFound === true)
       alert(`${loser} you have no legal moves`)
    return false;
  } 
  return true; 
}

function CheckAndhighlightAllowedMoves(originRow, originCol) {
  const playerIsWhite = player1turn ? true: false;
  let legalMoveFound = false;
  if (board[originRow][originCol].isPieceWhite === playerIsWhite && board[originRow][originCol].isPieceKing === true)
      if(checkHighlightForKing(originRow, originCol))
        legalMoveFound = true;
  const directionRow = player1turn ? -1 : 1;
  const directionRows = [directionRow, directionRow, 2 * directionRow, 2 * directionRow]
  const directionCol = [1, -1, 2, -2];
  for (let k = 0; k < 4 ; k++) {
    let targetCol = originCol + directionCol[k];
    let targetRow = originRow + directionRows[k]; 
    let targetIndex = convertAxesToIndex (targetRow, targetCol)  
    if (targetRow < 8 && targetRow > -1 && targetCol < 8 && targetCol > -1)
    {
      if (board[targetRow][targetCol].isPiece == false) {
        if (isMoveValid(originRow, originCol, targetRow, targetCol) === true) {
            legalMoveFound = true;
            board[targetRow][targetCol].isBlackCellMarked = true;
            cells[targetIndex].classList.add('allowed-move');
          }
      }      
    }        
  }
  leapCell = null; //הכרחי כדי למנוע מצב שבמהלך בדיקת המהלכים האפשריים על הלוח נדלק המשתנה הזה כאילו באמת בוצעה אכילה
  if (legalMoveFound === false) {
    alert('no legal moves for that piece found');
    board[originRow][originCol].isPieceMarked = false;
    originCell = null;
  }
}

function checkHighlightForKing(originRow, originCol){
  let legalMoveFound = false;
  for (let i = 0; i < 8; i++)
    {
      for (let j = 0; j< 8; j++)
      {
        const targetKingRow = i;
        const targetKingCol = j;
        const targetKingIndex = convertAxesToIndex(targetKingRow, targetKingCol);
        if (targetKingRow < 8 && targetKingRow > -1 && targetKingCol < 8 
          && targetKingCol > -1 && board[targetKingRow][targetKingCol].isPiece === false)
          if (isKingMoveValid(originRow, originCol, targetKingRow, targetKingCol) == true) {
            board[targetKingRow][targetKingCol].isBlackCellMarked = true;
            cells[targetKingIndex].classList.add('allowed-move');
            legalMoveFound = true;
          }
      }
    }
    if (legalMoveFound) 
        return true; 
}

function removeAlowedMoves() {
  for (let i = 0; i < 8; i ++){
    for (let j = 0; j <8; j++){
      let indexToCheck = convertAxesToIndex(i, j); 
      if (indexOfPossibleleaping.includes(indexToCheck) === false)
        board[i][j].isBlackCellMarked = false;
    }
  }
}

function findPiecesThatMustLeap (){
  let arrayOfPiecesThatNeedToBeBurned = []
  const opponentIsWhite = player1turn? false: true;
  const playerIsWhite = player1turn? true: false;
  let potentialBurnedPiecesFound = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j <8; j++) {
      const originRow = i;
      const originCol = j;
      const originIndex = convertAxesToIndex(originRow, originCol);
      if (board[originRow][originCol].isPiece === true && board[originRow][originCol].isPieceKing === true
        && board[originRow][originCol].isPieceWhite === playerIsWhite) {
          if(findIfKingMustLeap(originRow, originCol) == true){
              arrayOfPiecesThatNeedToBeBurned[potentialBurnedPiecesFound] = originIndex;
              potentialBurnedPiecesFound++;
            }
        }
      if(board[originRow][originCol].isPiece === true && board[originRow][originCol].isPieceWhite === playerIsWhite)
          if (possibleLeapsForRegularPiece(originRow, originCol, opponentIsWhite)) {
            arrayOfPiecesThatNeedToBeBurned[potentialBurnedPiecesFound] = originIndex;
            potentialBurnedPiecesFound++;
          }
    }
  }
  return arrayOfPiecesThatNeedToBeBurned;  
}

function possibleLeapsForRegularPiece(originRow, originCol, opponentIsWhite){
  {
    let directionRow = player1turn ? -1 : 1;
    let directionCol = 0;
    for (let j = 0; j < 2; j++) {
      directionCol = (j === 0) ? 1 : -1;
      let targetRow = originRow + 2 * directionRow;
      let targetCol = originCol + 2 * directionCol;
      if (targetRow >= 0 && targetRow <= 7 && targetCol >= 0 && targetCol <= 7) {
        if (board[targetRow][targetCol].isPiece === false){
            let middleRow = originRow + directionRow;
            let middleCol = originCol + directionCol;
            if (board[middleRow][middleCol].isPiece === true && board[middleRow][middleCol].isPieceWhite === opponentIsWhite){
              return true;
            }
          }
        }
    }
  }
}


