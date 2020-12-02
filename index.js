// Required packages and stuff
const express = require('express');
const expressSession = require('express-session')
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes')
const cookieParser = require('cookie-parser');
var randomWords = require('random-words');
const { isNullOrUndefined } = require('util');


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


/////////////////// SOCKET CODE HERE //////////////////////////////////////////


io.on('connection', socket => {

    //When new user connects
    socket.on('new-user', (roomCode, name) => {
        socket.join(roomCode)
        rooms[roomCode].users[socket.id] = name;
        console.log(`People in room:${roomCode} is ${Object.keys(rooms[roomCode].users).length} `)

        let data = (Object.keys(rooms[roomCode].users).length === 1);
        io.to(socket.id).emit('make-host', data)

        socket.to(roomCode).broadcast.emit('user-connected', name, socket.id);
    });

    //Sends back true/false if they are host or not
    socket.on('am-i-host', (roomCode) => {
        console.log("REACHED IN HERE")
        let data = (Object.keys(rooms[roomCode].users).length === 1);
        socket.emit('am-i-host', data);
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
    });
    socket.on('disable-draw', (roomCode) => {
        io.to(roomCode).emit('disable-draw');
    });
    socket.on('make-drawer', socketID => {
        io.to(socketID).emit('make-drawer', randomWords({ exactly: 1, maxLength: 10 }));
    });
    socket.on('assign-word', (roomCode, word) => {
        io.to(roomCode).emit('assign-word', word);
    });
    socket.on('round-update', (roomCode, message) => {
        io.to(roomCode).emit('round-update', message);
    });
    socket.on('round-reset', (roomCode) => {
        io.to(roomCode).emit('round-reset');
    });
    socket.on('game-end', (roomCode) => {
        io.to(roomCode).emit('game-end');
    });
    socket.on('save-score', (roomCode) => {
        io.to(roomCode).emit('save-score');
    });
    socket.on('db-update', (username, score) => {
        //UPDATE PLAYERS STUFF IN THE DATABASE here
        // Find by username then increase their games played by 1, and add the score to their previous score
        // Since the db stuff is in routs.js you might just have to make a function in routs like 
        //exports.updateUser = (username, score) => {
            // and in here you would do the updating for the user that is passed in from the parameters.
        //}

    });


    // Chat data
    socket.on('chat-message', (roomCode, message) => {
        socket.to(roomCode).broadcast.emit('chat-message', { message, name: rooms[roomCode].users[socket.id] });
    });
    socket.on('chat-notification', (roomCode, message) => {
        io.to(roomCode).emit('chat-notification', message);
    });

    //Update preGameTime
    socket.on('update-preGameTime', (roomCode, time)  => {
        io.to(roomCode).emit('update-preGameTime', time);
    })





    //User Disconnect
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(roomCode => {
            socket.to(roomCode).broadcast.emit('user-disconnected', `User: ${rooms[roomCode].users[socket.id]} disconnected.`, socket.id);
            delete rooms[roomCode].users[socket.id];
        });
    });

});


function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, roomCode]) => {
        if (roomCode.users[socket.id] != null) names.push(name)
        return names
    }, [])
}









// Servers listening port
server.listen(6969);



