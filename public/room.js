const allElementHolder = document.getElementById('allElementHolder');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.height = allElementHolder.offsetHeight;
canvas.width = allElementHolder.offsetWidth;
// canvas.width = window.innerWidth;
canvas.style.width = "100%";
canvas.style.height = "100%";

//variables
var painting = false;

const startPosition = (evt) => {
    painting = true;
    draw(evt);
}

const finishPosition = () => {
    painting = false;
    ctx.beginPath();
}

const draw = (evt) => {
    if (!painting) return;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    console.log(evt.clientX, evt.clientY)

    let pos = getCursorPosition(evt);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

const getCursorPosition = (evt)=> {
    var ClientRect = canvas.getBoundingClientRect();
    return {
        x: Math.round(evt.clientX - ClientRect.left),
        y: Math.round(evt.clientY - ClientRect.top)
    }
}


//Event Listeners
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishPosition);
canvas.addEventListener('mousemove', draw);