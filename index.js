// Required packages and stuff
const express = require('express');
const expressSession = require('express-session')
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes')
const cookieParser = require('cookie-parser');
var randomWords = require('random-words');


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
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    })
});
//app.post('/create', routes.verifyCreate);
app.post('/create', urlencodedParser, routes.createUser);
app.get('/about', routes.about);
app.get('/contact', routes.contact);

// PRIVATE PAGES - Needs authentication - May include the lobby page, the actual play page etc.
app.get('/private', checkAuth, routes.private);
app.get('/play', checkAuth, routes.play);
app.get('/room/:roomCode', checkAuth, routes.room)


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
const users = {}

io.on('connection', socket => {

    // Drawing data
    socket.on('draw', data => {
        socket.broadcast.emit('draw', data);
        console.log(data);
    });

    //All users data
    socket.on('new-user', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    });
    

    // Chat data
    socket.on('chat-message', message => {
        socket.broadcast.emit('chat-message', {message, name: users[socket.id]});
    });



});
















// Servers listening port
server.listen(6969);



