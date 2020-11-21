//// USE WHEN CLIENT IS SEPARATE FROM SERVER MACHINE
// const                   http:server_ip:server_port
//const socket = io.connect('http://192.168.1.221:6969')
//// USE WHEN RUNNING CLIENT AND SERVER ON SAME MACHINE
const socket = io.connect('http://localhost:6969')

// Drawing variables
var brushSize = 18;
var paintColor = 'Black';

// CANVAS
const canvasHolder = document.getElementById('canvasHolder');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.height = canvasHolder.clientHeight;
canvas.width = canvasHolder.clientWidth;
// canvas.width = window.innerWidth;
// canvas.style.width = "100%";
// canvas.style.height = "100%";
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear', evt);
})







// MESSAGES
const chatBox = document.getElementById('chatBox');
const messageText = document.getElementById('messageText');
const sendBtn = document.getElementById('sendBtn');


const startPosition = (evt) => {
    painting = true;
    ctx.beginPath();
    draw(evt);
}

const finishPosition = (evt) => {
    console.log('EVENT SENT')
    socket.emit('mouse-up', true);

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
    console.log(`POS:${pos.x}, ${pos.y}`);

    let data = {
        x: pos.x,
        y: pos.y,
        color: paintColor,
        size: brushSize
    }
    socket.emit('draw', data);


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
var name = 'Random User';


const sendMessage = () => {
    let message = messageText.value;
    console.log("IN HERE");

    if (message.trim().length > 0) {
        socket.emit('chat-message', message);
        appendMessage(`You: ${message}`);
        messageText.value = '';
    } else {
        appendMessage("WHAT!");
    }

}






//Event Listeners
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishPosition);
canvas.addEventListener('mouseout', finishPosition)
canvas.addEventListener('mousemove', draw);
sendBtn.addEventListener('click', sendMessage);
messageText.addEventListener('keyup', ({ key }) => {
    if (key === "Enter") {
        console.log("you pressed enter")
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
    appendMessage('You have joined');
    socket.emit('new-user', name);
}





///////// INCOMING SOCKET CODE HERE //////////////////////////////////
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

    //Logging las received x y points from different users
    lastPosX = data.x;
    lastPosY = data.y;
});

socket.on('clear', data => {
    console.log("clear event received")
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

// When a message is received
socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`);
});

// When a new user connects
socket.on('user-connected', name => {
    appendMessage(`User: ${name} connected`);
});