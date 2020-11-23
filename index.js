// Required packages and stuff
const express = require('express');
const expressSession = require('express-session')
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes')
const cookieParser = require('cookie-parser');
var randomWords = require('random-words');


const rooms = {}

const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
})
const server = require('http').createServer(app);
const io = require('socket.io')(server);


// Things the app is using
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname + '/public')));
app.use(cookieParser('This is my passphrase'));

const urlencodedParser = bodyParser.urlencoded({
    extended: true
});

// If user is authenticated it will proceeds to the requested path else redirects to home page
const checkAuth = (req, res, next) => {
    if (req.session.user && req.session.user.isAuthenticated) {

        next();
    } else {
        res.redirect('/login')
    }
}

app.use(expressSession({
    secret: 'whatever',
    saveUninitialized: true,
    resave: true
}));


// PUBLIC PAGES - Needs no authentication
app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', urlencodedParser, routes.verifyLogin);
app.get('/create', routes.create);
app.post('/create', urlencodedParser, routes.createUser);
app.get('/about', routes.about);
app.get('/contact', routes.contact);
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    })
});

// PRIVATE PAGES - Needs authentication - May include the lobby page, the actual play page etc.
app.get('/private', checkAuth, routes.private);
app.get('/play', checkAuth, routes.play);

app.post('/room', urlencodedParser, (req, res) => {
    console.log('Room CODE:', req.body.roomCode)

    if (rooms[req.body.roomCode] != null) {
        return res.redirect('/play')
    }
    rooms[req.body.roomCode] = { users: {} }
    res.redirect(`/room/${req.body.roomCode}`)
});

app.get('/room/:roomCode', checkAuth, (req, res) => {

    if (rooms[req.params.roomCode] == null) {
        return res.redirect('/play')
    }
    let username = req.session.user.username;
    console.log('Room username', username);
    res.render('room', {
        title: 'Room',
        icon_href: '/images/room.png',
        css_href: '/room.css',
        username,
        roomCode: req.params.roomCode
    });
});


// Catch all 
app.get('/*', routes.lost);


//if 2 people are in lobby timer begins
var timeLeft = 30;
    //var elem = document.getElementById('some_div');
    var timerId = setInterval( timer ,1000);
function timer()
{
    
    if (timeLeft == -1)
    {
        clearTimeout(timerId);
    }
    else
    {
        console.log(timeLeft);
        //elem.innerHTML = timeLeft + 'seconds remaining';
        timeLeft--;
    }
}






/////////////////// SOCKET CODE HERE //////////////////////////////////////////


io.on('connection', socket => {

      //All users data
    socket.on('new-user', (roomCode, name) => {
        socket.join(roomCode)
        rooms[roomCode].users[socket.id] = name;
        socket.to(roomCode).broadcast.emit('user-connected', name);
    });

    // Drawing data
    socket.on('draw', (roomCode, data) => {
        socket.to(roomCode).broadcast.emit('draw', data);
        console.log(data);
    });
    socket.on('clear', (roomCode, data) => {
        socket.to(roomCode).broadcast.emit('clear', data);
    })
    socket.on('mouse-up', (roomCode, data) => {
        socket.to(roomCode).broadcast.emit('mouse-up', data);
    })

  
    
    // Chat data
    socket.on('chat-message', (roomCode, message) => {
        socket.to(roomCode).broadcast.emit('chat-message', {message, name: rooms[roomCode].users[socket.id]});
    });



    //User Disconnect
    socket.on('disconnect', () => {
        
        getUserRooms(socket).forEach(roomCode => {
            socket.to(roomCode).broadcast.emit('user-disconnected', `User: ${rooms[roomCode].users[socket.id]} disconnected.`);
            delete rooms[roomCode].users[socket.id];
        })
        
    })



});


function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, roomCode]) => {
        if (roomCode.users[socket.id] != null) names.push(name)
        return names
    }, [])
}








// Servers listening port
server.listen(6969);



