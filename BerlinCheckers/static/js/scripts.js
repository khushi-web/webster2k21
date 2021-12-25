// done --> loading symbol before opponent joins showing the room code to be entered
// done --> prevent refresh, or leave the game on refresh
// show option like download screen rec after game has ended
// make room_code -> room_id
// add proper alerts
// make UI better

/*----------- Socket Connection --------*/
//console.log(room_code)
const socket = new WebSocket('ws://localhost:8000/ws/game/' + room_code)
socket.onopen = function(e){
    console.log("Socket Connected");
}

socket.onmessage = function(e){
    var data = JSON.parse(e.data)
    console.log("message received")
    if(data.payload.type === 'wait') {
        console.log("wait")
        document.getElementById('main').style.visibility = 'hidden';
        document.getElementById('loadingMenu').style.visibility = 'visible';
    } else if(data.payload.type === 'load') {
        console.log("load")
        document.getElementById('loadingMenu').style.visibility = 'hidden';
        document.getElementById('main').style.visibility = 'visible';
        setInitialScope()
    } else if(data.payload.type === 'endgame'){
        removeAllEventListeners();
        alert("Game has ended.");
    } else {
        setSelectedPieceForOpp(data.payload.selectedPiece, data.payload.turn, data.payload.number);
    }
}

socket.onclose = function(e){
    console.log("Socket Disconnected");
}
/*----------- Game State Data ----------*/

// const board = [
//     null, 0, null, 1, null, 2, null, 3,
//     4, null, 5, null, 6, null, 7, null,
//     null, 8, null, 9, null, 10, null, 11,
//     null, null, null, null, null, null, null, null,
//     null, null, null, null, null, null, null, null,
//     12, null, 13, null, 14, null, 15, null,
//     null, 16, null, 17, null, 18, null, 19,
//     20, null, 21, null, 22, null, 23, null
// ]

const board = game_squares
console.log(board);

/*---------- Cached Variables ----------*/

// parses pieceId's and returns the index of that piece's place on the board
let findPiece = function (pieceId) {
    let parsed = parseInt(pieceId);
    return board.indexOf(parsed);
};

// DOM referenes
const cells = document.querySelectorAll("td");
let redsPieces = document.querySelectorAll("p");
let blacksPieces = document.querySelectorAll("span")
const redTurnText = document.querySelectorAll(".red-turn-text");
const blackTurntext = document.querySelectorAll(".black-turn-text");
const divider = document.querySelector("#divider")

///player properties
// let turn = game.turn;
// let redScore = game.red_score;
// let blackScore = game.black_score;
let playerPieces;


// selected piece properties
let selectedPiece = {
    pieceId: -1,
    indexOfBoardPiece: -1,
    isKing: false,
    seventhSpace: false,
    ninthSpace: false,
    fourteenthSpace: false,
    eighteenthSpace: false,
    minusSeventhSpace: false,
    minusNinthSpace: false,
    minusFourteenthSpace: false,
    minusEighteenthSpace: false
}

// function putpieces()
// {
//     //selectedPiece.indexOfBoardPiece = findPiece(selectedPiece.pieceId);
//     for(var i=0;i<64;i++)
//     {
//         if(board[i] === null)
//         {
//             document.getElementById(i).remove();
//             cells[i].innerHTML = "";
//             cells[i].setAttribute("class", "noPieceHere");
//         }
//         else if(board[i] <= 11)
//         {
//             cells[i].innerHTML = `<p class="red-piece" id="${board[i]}"></p>`;
//             redsPieces = document.querySelectorAll("p");

//         }
//         else
//         {
//             cells[i].innerHTML = `<p class="black-piece" id="${board[i]}"></p>`;
//             blacksPieces = document.querySelectorAll("span")
//         }
//     }
// }

// putpieces();
/*---------- Event Listeners ----------*/

// initialize event listeners on pieces
function givePiecesEventListeners() {
    if (turn) {
        for (let i = 0; i < redsPieces.length; i++) {
            redsPieces[i].addEventListener("click", getPlayerPieces);
        }
    } else {
        for (let i = 0; i < blacksPieces.length; i++) {
            blacksPieces[i].addEventListener("click", getPlayerPieces);
        }
    }
}
 
function setInitialScope() {
    if(player === 'game_opponent') {
        removeAllEventListeners()
    }
}

/*---------- Logic ----------*/

// holds the length of the players piece count
function getPlayerPieces() {
    if (turn) {
        playerPieces = redsPieces;
    } else {
        playerPieces = blacksPieces;
    }
    removeCellonclick();
    resetBorders();
}

// removes possible moves from old selected piece (* this is needed because the user might re-select a piece *)
function removeCellonclick() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeAttribute("onclick");
    }
}

// resets borders to default
function resetBorders() {
    for (let i = 0; i < playerPieces.length; i++) {
        playerPieces[i].style.border = "1px solid white";
    }
    resetSelectedPieceProperties();
    getSelectedPiece();
}

// resets selected piece properties
function resetSelectedPieceProperties() {
    selectedPiece.pieceId = -1;
    selectedPiece.isKing = false;
    selectedPiece.seventhSpace = false;
    selectedPiece.ninthSpace = false;
    selectedPiece.fourteenthSpace = false;
    selectedPiece.eighteenthSpace = false;
    selectedPiece.minusSeventhSpace = false;
    selectedPiece.minusNinthSpace = false;
    selectedPiece.minusFourteenthSpace = false;
    selectedPiece.minusEighteenthSpace = false;
}

// gets ID and index of the board cell its on
function getSelectedPiece() {
    selectedPiece.pieceId = parseInt(event.target.id);
    selectedPiece.indexOfBoardPiece = findPiece(selectedPiece.pieceId);
    console.log(selectedPiece);
    isPieceKing();
}

function setSelectedPieceForOpp(selectedPieceOpp, turnOpp, number){
    if(turn === turnOpp){
        selectedPiece = selectedPieceOpp;
        turn = turnOpp;
        setOpponentPiece(selectedPiece, number, turn)
    }
    else {
        console.log("SAME AS HOST")
        removeAllEventListeners()
    }
}

// checks if selected piece is a king
function isPieceKing() {
    if (document.getElementById(selectedPiece.pieceId).classList.contains("king")) {
        selectedPiece.isKing = true;
    } else {
        selectedPiece.isKing = false;
    }
    getAvailableSpaces();
}

// gets the moves that the selected piece can make
function getAvailableSpaces() {
    if (board[selectedPiece.indexOfBoardPiece + 7] === null && 
        cells[selectedPiece.indexOfBoardPiece + 7].classList.contains("noPieceHere") !== true) {
        selectedPiece.seventhSpace = true;
    }
    if (board[selectedPiece.indexOfBoardPiece + 9] === null && 
        cells[selectedPiece.indexOfBoardPiece + 9].classList.contains("noPieceHere") !== true) {
        selectedPiece.ninthSpace = true;
    }
    if (board[selectedPiece.indexOfBoardPiece - 7] === null && 
        cells[selectedPiece.indexOfBoardPiece - 7].classList.contains("noPieceHere") !== true) {
        selectedPiece.minusSeventhSpace = true;
    }
    if (board[selectedPiece.indexOfBoardPiece - 9] === null && 
        cells[selectedPiece.indexOfBoardPiece - 9].classList.contains("noPieceHere") !== true) {
        selectedPiece.minusNinthSpace = true;
    }
    checkAvailableJumpSpaces();
}

// gets the moves that the selected piece can jump
function checkAvailableJumpSpaces() {
    if (turn) {
        if (board[selectedPiece.indexOfBoardPiece + 14] === null 
        && cells[selectedPiece.indexOfBoardPiece + 14].classList.contains("noPieceHere") !== true
        && board[selectedPiece.indexOfBoardPiece + 7] >= 12) {
            selectedPiece.fourteenthSpace = true;
        }
        if (board[selectedPiece.indexOfBoardPiece + 18] === null 
        && cells[selectedPiece.indexOfBoardPiece + 18].classList.contains("noPieceHere") !== true
        && board[selectedPiece.indexOfBoardPiece + 9] >= 12) {
            selectedPiece.eighteenthSpace = true;
        }
        if (board[selectedPiece.indexOfBoardPiece - 14] === null 
        && cells[selectedPiece.indexOfBoardPiece - 14].classList.contains("noPieceHere") !== true
        && board[selectedPiece.indexOfBoardPiece - 7] >= 12) {
            selectedPiece.minusFourteenthSpace = true;
        }
        if (board[selectedPiece.indexOfBoardPiece - 18] === null 
        && cells[selectedPiece.indexOfBoardPiece - 18].classList.contains("noPieceHere") !== true
        && board[selectedPiece.indexOfBoardPiece - 9] >= 12) {
            selectedPiece.minusEighteenthSpace = true;
        }
    } else {
        if (board[selectedPiece.indexOfBoardPiece + 14] === null 
        && cells[selectedPiece.indexOfBoardPiece + 14].classList.contains("noPieceHere") !== true
        && board[selectedPiece.indexOfBoardPiece + 7] < 12 && board[selectedPiece.indexOfBoardPiece + 7] !== null) {
            selectedPiece.fourteenthSpace = true;
        }
        if (board[selectedPiece.indexOfBoardPiece + 18] === null 
        && cells[selectedPiece.indexOfBoardPiece + 18].classList.contains("noPieceHere") !== true
        && board[selectedPiece.indexOfBoardPiece + 9] < 12 && board[selectedPiece.indexOfBoardPiece + 9] !== null) {
            selectedPiece.eighteenthSpace = true;
        }
        if (board[selectedPiece.indexOfBoardPiece - 14] === null && cells[selectedPiece.indexOfBoardPiece - 14].classList.contains("noPieceHere") !== true
        && board[selectedPiece.indexOfBoardPiece - 7] < 12 
        && board[selectedPiece.indexOfBoardPiece - 7] !== null) {
            selectedPiece.minusFourteenthSpace = true;
        }
        if (board[selectedPiece.indexOfBoardPiece - 18] === null && cells[selectedPiece.indexOfBoardPiece - 18].classList.contains("noPieceHere") !== true
        && board[selectedPiece.indexOfBoardPiece - 9] < 12
        && board[selectedPiece.indexOfBoardPiece - 9] !== null) {
            selectedPiece.minusEighteenthSpace = true;
        }
    }
    checkPieceConditions();
}

// restricts movement if the piece is a king
function checkPieceConditions() {
    if (selectedPiece.isKing) {
        givePieceBorder();
    } else {
        if (turn) {
            selectedPiece.minusSeventhSpace = false;
            selectedPiece.minusNinthSpace = false;
            selectedPiece.minusFourteenthSpace = false;
            selectedPiece.minusEighteenthSpace = false;
        } else {
            selectedPiece.seventhSpace = false;
            selectedPiece.ninthSpace = false;
            selectedPiece.fourteenthSpace = false;
            selectedPiece.eighteenthSpace = false;
        }
        givePieceBorder();
    }
}

// gives the piece a green highlight for the user (showing its movable)
function givePieceBorder() {
    if (selectedPiece.seventhSpace || selectedPiece.ninthSpace || selectedPiece.fourteenthSpace || selectedPiece.eighteenthSpace
    || selectedPiece.minusSeventhSpace || selectedPiece.minusNinthSpace || selectedPiece.minusFourteenthSpace || selectedPiece.minusEighteenthSpace) {
        document.getElementById(selectedPiece.pieceId).style.border = "3px solid green";
        giveCellsClick();
    } else {
        return;
    }
}

// gives the cells on the board a 'click' bassed on the possible moves
function giveCellsClick() {
    if (selectedPiece.seventhSpace) {
        cells[selectedPiece.indexOfBoardPiece + 7].setAttribute("onclick", "makeMove(7)");
    }
    if (selectedPiece.ninthSpace) {
        cells[selectedPiece.indexOfBoardPiece + 9].setAttribute("onclick", "makeMove(9)");
    }
    if (selectedPiece.fourteenthSpace) {
        cells[selectedPiece.indexOfBoardPiece + 14].setAttribute("onclick", "makeMove(14)");
    }
    if (selectedPiece.eighteenthSpace) {
        cells[selectedPiece.indexOfBoardPiece + 18].setAttribute("onclick", "makeMove(18)");
    }
    if (selectedPiece.minusSeventhSpace) {
        cells[selectedPiece.indexOfBoardPiece - 7].setAttribute("onclick", "makeMove(-7)");
    }
    if (selectedPiece.minusNinthSpace) {
        cells[selectedPiece.indexOfBoardPiece - 9].setAttribute("onclick", "makeMove(-9)");
    }
    if (selectedPiece.minusFourteenthSpace) {
        cells[selectedPiece.indexOfBoardPiece - 14].setAttribute("onclick", "makeMove(-14)");
    }
    if (selectedPiece.minusEighteenthSpace) {
        cells[selectedPiece.indexOfBoardPiece - 18].setAttribute("onclick", "makeMove(-18)");
    }
}

/* v when the cell is clicked v */

// makes the move that was clicked
function makeMove(number) {

    console.log(selectedPiece.pieceId);
    console.log(selectedPiece.indexOfBoardPiece);
    console.log(number);
    console.log(turn);

    var data = {
        'type': 'move',
        'selectedPiece' : selectedPiece,
        'turn' : turn,
        'number' : number
    }

    socket.send(JSON.stringify({
        data
    }));

    document.getElementById(selectedPiece.pieceId).remove();
    cells[selectedPiece.indexOfBoardPiece].innerHTML = "";
    if (turn) {
        if (selectedPiece.isKing) {
            cells[selectedPiece.indexOfBoardPiece + number].innerHTML = `<p class="red-piece king" id="${selectedPiece.pieceId}"></p>`;
            redsPieces = document.querySelectorAll("p");
        } else {
            cells[selectedPiece.indexOfBoardPiece + number].innerHTML = `<p class="red-piece" id="${selectedPiece.pieceId}"></p>`;
            redsPieces = document.querySelectorAll("p");
        }
    } else {
        if (selectedPiece.isKing) {
            cells[selectedPiece.indexOfBoardPiece + number].innerHTML = `<span class="black-piece king" id="${selectedPiece.pieceId}"></span>`;
            blacksPieces = document.querySelectorAll("span");
        } else {
            cells[selectedPiece.indexOfBoardPiece + number].innerHTML = `<span class="black-piece" id="${selectedPiece.pieceId}"></span>`;
            blacksPieces = document.querySelectorAll("span");
        }
    }

    let indexOfPiece = selectedPiece.indexOfBoardPiece
    if (number === 14 || number === -14 || number === 18 || number === -18) {
        changeData(indexOfPiece, indexOfPiece + number, indexOfPiece + number / 2);
    } else {
        changeData(indexOfPiece, indexOfPiece + number);
    }
}

function setOpponentPiece(selectedPiece, number, turnOpp){

    if(turnOpp === turn)
    {
        console.log(selectedPiece.pieceId);
        console.log(selectedPiece.indexOfBoardPiece);
        console.log(number);
        console.log(turn)

        document.getElementById(selectedPiece.pieceId).remove();
        cells[selectedPiece.indexOfBoardPiece].innerHTML = "";
        if (turn) {
            if (selectedPiece.isKing) {
                cells[selectedPiece.indexOfBoardPiece + number].innerHTML = `<p class="red-piece king" id="${selectedPiece.pieceId}"></p>`;
                redsPieces = document.querySelectorAll("p");
            } else {
                cells[selectedPiece.indexOfBoardPiece + number].innerHTML = `<p class="red-piece" id="${selectedPiece.pieceId}"></p>`;
                redsPieces = document.querySelectorAll("p");
            }
        } else {
            if (selectedPiece.isKing) {
                cells[selectedPiece.indexOfBoardPiece + number].innerHTML = `<span class="black-piece king" id="${selectedPiece.pieceId}"></span>`;
                blacksPieces = document.querySelectorAll("span");
            } else {
                cells[selectedPiece.indexOfBoardPiece + number].innerHTML = `<span class="black-piece" id="${selectedPiece.pieceId}"></span>`;
                blacksPieces = document.querySelectorAll("span");
            }
        }

        let indexOfPiece = selectedPiece.indexOfBoardPiece
        if (number === 14 || number === -14 || number === 18 || number === -18) {
            changeData(indexOfPiece, indexOfPiece + number, indexOfPiece + number / 2);
        } else {
            changeData(indexOfPiece, indexOfPiece + number);
        }
    }
}


// Changes the board states data on the back end
function changeData(indexOfBoardPiece, modifiedIndex, removePiece) {
    board[indexOfBoardPiece] = null;
    board[modifiedIndex] = parseInt(selectedPiece.pieceId);
    if (turn && selectedPiece.pieceId < 12 && modifiedIndex >= 57) {
        document.getElementById(selectedPiece.pieceId).classList.add("king")
    }
    if (turn === false && selectedPiece.pieceId >= 12 && modifiedIndex <= 7) {
        document.getElementById(selectedPiece.pieceId).classList.add("king");
    }
    if (removePiece) {
        board[removePiece] = null;
        if (turn && selectedPiece.pieceId < 12) {
            cells[removePiece].innerHTML = "";
            blackScore--
        }
        if (turn === false && selectedPiece.pieceId >= 12) {
            cells[removePiece].innerHTML = "";
            redScore--
        }
    }
    resetSelectedPieceProperties();
    removeCellonclick();
    removeEventListeners();
    console.log(selectedPiece.pieceId)
}

// removes the 'onClick' event listeners for pieces
function removeEventListeners() {
    if (turn) {
        for (let i = 0; i < redsPieces.length; i++) {
            redsPieces[i].removeEventListener("click", getPlayerPieces);
        }
    } else {
        for (let i = 0; i < blacksPieces.length; i++) {
            blacksPieces[i].removeEventListener("click", getPlayerPieces);
        }
    }
    checkForWin();
}

// When the player has played its chance


// Checks for a win
function checkForWin() {
    if (blackScore === 0) {
        divider.style.display = "none";
        for (let i = 0; i < redTurnText.length; i++) {
            redTurnText[i].style.color = "black";
            blackTurntext[i].style.display = "none";
            redTurnText[i].textContent = "RED WINS!";
            var data = {
                'type': 'endgame',
                'result': 'R'
            }
            socket.send(JSON.stringify({
                data
            }));
        }
    } else if (redScore === 0) {
        divider.style.display = "none";
        for (let i = 0; i < blackTurntext.length; i++) {            
            blackTurntext[i].style.color = "black";
            redTurnText[i].style.display = "none";
            blackTurntext[i].textContent = "BLACK WINS!";
            var data = {
                'type' : 'endgame',
                'result' : 'B'
            }
            socket.send(JSON.stringify({
                data
            }));
        }
    } else {
        var data = {
            'type' : 'state',
            'board' : board,
            'turn' : !turn,
            'redScore' : redScore,
            'blackScore' : blackScore
        }
        socket.send(JSON.stringify({
            data
        }));
        changePlayer();
    }
}

// Switches players turn
function changePlayer() {
    if (turn) {
        turn = false;
        for (let i = 0; i < redTurnText.length; i++) {
            redTurnText[i].style.color = "lightGrey";
            blackTurntext[i].style.color = "black";
        }
    } else {
        turn = true;
        for (let i = 0; i < blackTurntext.length; i++) {
            blackTurntext[i].style.color = "lightGrey";
            redTurnText[i].style.color = "black";
        }
    }
    givePiecesEventListeners();
}

function gameDraw() {
    
    var data = {
        'type' : 'endgame',
        'result' : 'D'
    }

    socket.send(JSON.stringify({
        data
    }));

    removeAllEventListeners();
}

function removeAllEventListeners() {
    for (let i = 0; i < redsPieces.length; i++) {
        redsPieces[i].removeEventListener("click", getPlayerPieces);
    }
    for (let i = 0; i < blacksPieces.length; i++) {
        blacksPieces[i].removeEventListener("click", getPlayerPieces);
    }
}

givePiecesEventListeners();