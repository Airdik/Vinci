// Required packages and stuff
const express = require('express');
const expressSession = require('express-session')
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes')
const cookieParser = require('cookie-parser');

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









/////////////////// SOCKET CODE HERE //////////////////////////////////////////
io.on('connection', socket => {
    socket.emit('first-connect', `Connected to socket! ID:${socket.id}`)
    console.log(`User connected, ID: ${socket.id}`)

    socket.on('draw', data => {
        socket.broadcast.emit('draw', data);
        console.log(data);
    })
});
















// Servers listening port
server.listen(6969);



