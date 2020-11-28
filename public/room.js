//// USE WHEN CLIENT IS SEPARATE FROM SERVER MACHINE
// const                   http:server_ip:server_port
// const socket = io.connect('http://71.205.38.64:6969')
//// USE WHEN RUNNING CLIENT AND SERVER ON SAME MACHINE
const socket = io.connect('http://localhost:6969')

// Getting required elements
const timeHolder = document.getElementById('time');
const wordHolder = document.getElementById('word');
const scoreHolder = document.getElementById('score')
const roundHolder = document.getElementById('round');
const chatBox = document.getElementById('chatBox');
const messageText = document.getElementById('messageText');
const sendBtn = document.getElementById('sendBtn');


// ALL game control variables for host.
const preGameTime = 5;
const drawingTime = 10;
const numOfRounds = 3;
var isHost = false;
var isDrawer = true;
var hasGuessedCorrectly = false;
var wordToDraw = '';
var wordToDrawLength = -1;
var round = 1;

var myScore = 0;
var currentPlayerIndex = 0;
var listOfPlayers = [];



// Drawing variables
var brushSize = 18;
var paintColor = 'Black';

// CANVAS
const canvasHolder = document.getElementById('canvasHolder');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.height = canvasHolder.clientHeight;
canvas.width = canvasHolder.clientWidth;
var painting = false;
var oldWidth = canvasHolder.clientWidth;
var oldHeight = canvasHolder.clientHeight;
var lastPosX = -50;
var lastPosY = -50;


// DRAWING TOOLS STUFF
document.querySelectorAll('.brush').forEach(item => {
    item.addEventListener('click', evt => {
        if (evt.target.id === '1') {
            brushSize = 12;
        } else if (evt.target.id === '2') {
            brushSize = 18;
        } else {
            brushSize = 26;
        }
    })
})


document.querySelectorAll('.color').forEach(item => {
    item.addEventListener('click', evt => {
        paintColor = evt.target.id;
    })
})
document.getElementById('erase').addEventListener('click', evt => {
    paintColor = 'White';
})
document.getElementById('clear').addEventListener('click', evt => {
    if (isDrawer) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('clear', roomCode, evt);
    }

})
const colorPick = document.getElementById('colorPick');
colorPick.addEventListener('change', evt => {
    paintColor = colorPick.value;
})

const startPosition = (evt) => {

    painting = isDrawer;
    ctx.beginPath();
    draw(evt);
}
const finishPosition = (evt) => {
    socket.emit('mouse-up', roomCode, true);

    painting = false;
    ctx.beginPath();
}
const draw = (evt) => {

    if (!painting) {

        return;
    }

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = paintColor;


    let pos = getCursorPosition(evt);
    // console.log(`EVT:${evt.clientX}, ${evt.clientY}`);
    console.log(`Is host: ${isHost}`)

    let data = {
        x: pos.x,
        y: pos.y,
        color: paintColor,
        size: brushSize
    }
    socket.emit('draw', roomCode, data);


    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}
const getCursorPosition = (evt) => {
    var ClientRect = canvas.getBoundingClientRect();
    return {
        x: Math.round(evt.clientX - ClientRect.left),
        y: Math.round(evt.clientY - ClientRect.top)
    }
}

const appendMessage = (message) => {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = message;
    messageElement.style.padding = "4px";
    chatBox.append(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}



const sendMessage = () => {
    let message = messageText.value;

    if (!isDrawer) {

        if (message.trim().length > 0) {
            if (message.trim().toLowerCase().includes(wordToDraw)) {
                if (!hasGuessedCorrectly) {
                    myScore += 50;
                    scoreHolder.innerHTML = `Score: ${myScore}`
                    socket.emit('chat-notification', roomCode, `*${name} guessed correctly!*`)
                    hasGuessedCorrectly = true;
                } else {
                    appendMessage(`You: ${message} (Not Sent)`)
                }

            } else {
                socket.emit('chat-message', roomCode, message);
                appendMessage(`You: ${message}`);
            }

        } else {
            appendMessage("HUH!");
        }
    } else {
        appendMessage('Cannot message while drawing.')
    }
    messageText.value = '';


}

// Timer before actual game starts, activated when at least 2 people are in the lobby
const startPreGameTimer = () => {
    let timeLeft = preGameTime;
    let timerId = setInterval(timer, 1000);

    function timer() {
        if (timeLeft == -1) {
            clearTimeout(timerId);
            //Shuffling the players for random turns
            if (isHost) {
                shuffleArray(listOfPlayers);
                startGame();
            }

        } else {
            socket.emit('update-preGameTime', roomCode, `${timeLeft}`);
            timeLeft--;
        }
    }
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


//  Starting game functions
function startGame() {
    socket.emit('disable-draw', roomCode);
    socket.emit('clear', roomCode);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('make-drawer', listOfPlayers[currentPlayerIndex]);
    currentPlayerIndex++;
}
function advanceRound() {
    socket.emit('round-reset', roomCode);
    if (currentPlayerIndex == (listOfPlayers.length)) {

        if (round < numOfRounds) {
            currentPlayerIndex = 0;
            round++;
            socket.emit('round-update', roomCode, `Round ${round} of ${numOfRounds}`);
            startGame();
        } else {
            console.log('GAME ENDED!')
            socket.emit('game-end', roomCode) // possibly send final scores or all players here.
        }

    } else {
        startGame();
    }
}

function updateWordHolder(word) {
    wordToDraw = `${word}`;
    wordToDrawLength = wordToDraw.length;
    if (isDrawer) {
        wordHolder.style = 'color: blue;'
        wordHolder.innerHTML = `${word}`
    } else {
        let blank = '__ ';
        wordHolder.innerHTML = blank.repeat((word.length - 1)) + '__'
    }
}

function updateTimeHolder() {
    let timeLeft = drawingTime;

    let timerId = setInterval(drawTimer, 1000);

    function drawTimer() {
        if (timeLeft < 0) {
            clearTimeout(timerId);
            if (isHost) {
                advanceRound();
            }

        } else {
            timeHolder.innerHTML = `Round Time Remaining: ${timeLeft}`
            timeLeft--;
        }

    }

}


////Event Listeners
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishPosition);
canvas.addEventListener('mouseout', finishPosition)
canvas.addEventListener('mousemove', draw);
sendBtn.addEventListener('click', sendMessage);
messageText.addEventListener('keyup', ({ key }) => {
    if (key === "Enter") {
        sendMessage();
    }
})

window.onresize = () => {
    // canvas.height = canvasHolder.clientHeight;
    // canvas.width = canvasHolder.clientWidth;

    let ratio1 = oldWidth / canvasHolder.clientWidth;
    let ratio2 = oldHeight / canvasHolder.clientHeight;

    ctx.scale(ratio1, ratio2);
    oldWidth = canvasHolder.clientWidth;
    oldHeight = canvasHolder.clientHeight;

}
window.onload = () => {
    console.log("ROOM CODE:", roomCode);
    appendMessage('You have joined');
    socket.emit('new-user', roomCode, name);
    //socket.emit('am-i-host', roomCode)
}





///////// INCOMING SOCKET CODE HERE //////////////////////////////////


////      HOST INFO UPDATES       ////
socket.on('make-host', (data) => {
    console.log('MADE HOST REACHED')
    isHost = data;
    listOfPlayers.push(socket.id);
});


socket.on('mouse-up', (data) => {
    ctx.beginPath();
});
socket.on('draw', data => {


    ctx.lineWidth = data.size;
    ctx.lineCap = 'round';
    ctx.strokeStyle = data.color;

    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);

    //Logging last received x y points from different users
    lastPosX = data.x;
    lastPosY = data.y;
});

socket.on('clear', data => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// When a message is received
socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`);
});
socket.on('chat-notification', data => {
    appendMessage(`${data}`);
});

// When a new user connects
socket.on('user-connected', (name, socketID) => {

    listOfPlayers.push(socketID);
    appendMessage(`User: ${name} connected`);

    if (isHost) {
        console.log(`PLAYERS IN LOBBY: ${listOfPlayers}`)
        if (listOfPlayers.length > 1) {
            console.log(`# OF PLAYERS IN LOBBY: ${listOfPlayers.length}`)
            startPreGameTimer();
        }
    }
});

//When update preGameTime is received
socket.on('update-preGameTime', time => {
    console.log(`Receiving time: ${time}`)
    timeHolder.innerHTML = `Starting in ${time} seconds`
});

//When disable draw command is received
socket.on('disable-draw', () => {
    isDrawer = false;
});

//When this client is selected to be the drawer
socket.on('make-drawer', data => {
    wordToDraw = `${data}`;
    wordToDrawLength = wordToDraw.length;
    console.log(`I am drawer my word is: ${wordToDraw} it is ${wordToDrawLength} letters long.`);
    isDrawer = true;
    socket.emit('assign-word', roomCode, wordToDraw);
});
socket.on('assign-word', word => {
    console.log("assign-word command received")
    updateWordHolder(word);
    updateTimeHolder();
});

socket.on('round-update', (message) => {
    roundHolder.innerHTML = `${message}`
});
socket.on('round-reset', () => {
    hasGuessedCorrectly = false;
    isDrawer = false;
    wordToDraw = '';
    wordToDrawLength = -1;
});



// When game is over
socket.on('game-end', () => {
    timeHolder.innerHTML = 'Game Over!';
})

// When user disconnects
socket.on('user-disconnected', (message, socketID) => {
    if (isHost) {
        console.log(`Before removal: ${listOfPlayers}`)
        listOfPlayers = listOfPlayers.filter(arrayItem => arrayItem !== socketID);
        console.log(`After removal: ${listOfPlayers}`)
    }
    appendMessage(message);
});