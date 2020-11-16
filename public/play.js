const createCode = document.getElementById('createCode');
const joinCode = document.getElementById('joinCode');
const socket = io.connect('http://localhost:6969')

socket.on('first-connect', data => {
    console.log(data);
});

const codePattern = /^d\/{4,}$/g

const create = document.getElementById('create').addEventListener('click', () => {
    console.log("CREATE CLICKED");
});
const join = document.getElementById('join').addEventListener('click', () => {
    console.log("JOIN CLICKED");
});
const findRoom = document.getElementById('findRoom').addEventListener('click', () => {

});