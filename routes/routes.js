const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb+srv://user:pass@cluster0.zylfw.mongodb.net/users?retryWrites=true&w=majority', {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

let mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error'));
mdb.once('open', callback => {

});

let userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String,
    email: String,
    wins: Number,
    losses: Number,
    total_points: Number
});

let User = mongoose.model('User_Collection', userSchema);

exports.index = (req, res) => {
    let today = new Date();
    let date = `${today.getMonth()}-${today.getDate()}-${today.getFullYear()}     ${(today.getHours() + 24) % 12 || 12}:${today.getMinutes()}:${today.getSeconds()}`

    let displayDate = '';
    if (req.cookies.lastVisit) {
        displayDate = `Last Visited: ${req.cookies.lastVisit}`;
    } else {
        displayDate = `Welcome!`
    }

    //// TEST - Logging to console to see print all users in database
    User.find((err, user) => {
        if (err) return console.error(err);
        console.log(user);
    });
    //User.collection.remove();

    res.cookie('lastVisit', date, { maxAge: 999999999999 });

    res.render('index', {
        title: 'Home',
        icon_href: '/images/home.png',
        lastVisitedTime: displayDate
    });


}

// LOGIN page
exports.login = (req, res) => {
    res.render('login', {
        title: 'Login',
        icon_href: '/images/login.png',
        css_href: '/login.css'
    });
}

exports.about = (req, res) => {
    res.render('about', {
        title: 'About',
        icon_href: '/images/about.png',
        css_href: '/about.css'
    })
}

exports.contact = (req, res) => {
    res.render('contact', {
        title: 'Contact',
        icon_href: '/images/contact.png',
        css_href: '/contact.css'
    })
}

var findByUsername = function (username, done) {
    User.find({ "username": username }, (err, data) => {
        if (err) return done(err)
        return done(null, data)
    })
};

// Check user info against the database
exports.verifyLogin = async (req, res) => {
    // ******* THIS IS WHERE WE SHOULD CHECK AGAINST THE DATABASE TO CHECK IF THE USER EXISTS AND THE PASSWORD MATCHES *******
    // instead of req.body.user === 'user' &&...     it would be some thing like req.body.user exists in the database && the password matches that is in the database

    let user = await User.findOne({ username: req.body.username });
    if (user == null) {
        res.redirect('/login');
        console.log(`*Username: "${req.body.username}" not found in database.*`);
    } else {
        let validPassword = await bcrypt.compare(req.body.password, user.password);
        if (validPassword) {
            // once user and pass are verified then we create a session with any key:value pair we want, which we can check for later
            req.session.user = {
                isAuthenticated: true,
                username: user.username
            }
            console.log(`User: "${req.body.username}" was authenticated.`);
            //Once logged in redirect to this page
            res.redirect('/play');
        } else {
            res.redirect('/login');
            console.log(`*Failed to log in, user "${req.body.username}" entered the wrong password.`);
        }

    }
}

// CREATE page
exports.create = (req, res) => {
    res.render('create', {
        title: 'Create Account',
        icon_href: '/images/create.png',
        css_href: '/create.css',
        script_src: 'create.js'
    })
}

//Get Random User
exports.pickPlayer = async (req, res) => {
User.find({}, function (err, users){
    var userMap = {};

    users.forEach(function(user){
        userMap[user.username] = user;
    });

    var shuffled = shuffle(userMap);
    var drawer = shuffled[0];

    console.log(drawer);

    });
}


// Creating user in the database
exports.createUser = async (req, res) => {
    let dbUser = await User.findOne({ username: req.body.username });
 
    if (dbUser == null) {

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);
        let user = new User({
            firstName: req.body.fname,
            lastName: req.body.lname,
            username: req.body.username,
            password: hash,
            email: req.body.email,
            wins: 0,
            losses: 0,
            total_points: 0
        });
        user.save((err, user) => {
            if (err) return console.error(err);
            console.log(user.firstName + ' added');
        });
        res.redirect('/login');
    } else {
        res.render('create', {
            title: 'Create Account',
            icon_href: '/images/create.png',
            css_href: '/create.css',
            script_src: 'create.js',
            UsernameExists: `*Username: "${req.body.username}" already exists. Please choose a new username.*`
        });
        console.log(`*Username: "${req.body.username}" already exists.*`);
    }
};

// After user creates account add them to database
exports.verifyCreate = (req, res) => {
    res.send('IMPLEMENT ADDING PERSON TO DATABASE')
}





exports.private = (req, res) => {
    res.send('YOU ARE LOGGED IN!')
}

exports.play = (req, res) => {
    res.render('play', {
        title: 'Play',
        icon_href: '/images/play.png',
        css_href: '/play.css'
    });
}

exports.room = (req, res) => {

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
}



















exports.lost = (req, res) => {
    res.render('lost', {
        title: 'Lost?',
        css_href: 'lost.css',
        icon_href: '/images/lost.png'
    });
}