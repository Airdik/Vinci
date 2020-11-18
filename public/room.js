
//// USE WHEN CLIENT IS SEPARATE FROM SERVER MACHINE
// const                   http:server_ip:server_port
//const socket = io.connect('http://192.168.1.221:6969')
//// USE WHEN RUNNING CLIENT AND SERVER ON SAME MACHINE
const socket = io.connect('http://localhost:6969')


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
    
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    

    let pos = getCursorPosition(evt);
    // console.log(`EVT:${evt.clientX}, ${evt.clientY}`);
    console.log(`POS:${pos.x}, ${pos.y}`);

    let data = {
        x: pos.x,
        y: pos.y
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
    name = prompt('What would you like to go by?');
    appendMessage('You have joined');
    socket.emit('new-user', name);
}





///////// INCOMING SOCKET CODE HERE //////////////////////////////////
socket.on('mouse-up', (data) => {
    ctx.beginPath();
});
socket.on('draw', data => {
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);

    //Logging las received x y points from different users
    lastPosX = data.x;
    lastPosY = data.y;
});

// When a message is received
socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`);
});

// When a new user connects
socket.on('user-connected', name => {
    appendMessage(`User: ${name} connected`);
});