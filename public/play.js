const createCode = document.getElementById('createCode');
const joinCode = document.getElementById('joinCode');

//// USE WHEN CLIENT IS SEPARATE FROM SERVER MACHINE
// const                   http:server_ip:server_port
//const socket = io.connect('http://192.168.1.221:6969')
//// USE WHEN RUNNING CLIENT AND SERVER ON SAME MACHINE
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