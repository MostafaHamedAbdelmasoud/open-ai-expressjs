const path = require('path');
const express = require('express');
const dotenv = require('dotenv').config();
const port = process.env.PORT || 4000;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser'); // parser middleware
const MongoStore = require('connect-mongo');
const User = require('./models/user.js'); // User Model 

const app = express();
app.use(bodyParser.json());

// Enable body parser

// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));


const userName = "root";
const password = "example";
const databasePort = "27017";
const dbHost = "mongo";

const dbStoreMongoDB = `mongodb://${userName}:${password}@${dbHost}:${databasePort}`;
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
    saveUninitialized: false,


    store: new MongoStore({
        // mongoUrl: process.env.DB_URL
        mongoUrl: dbStoreMongoDB
        , createAutoRemoveIdx: false,
        autoRemove: 'interval',
        autoRemoveInterval: 60 // In minutes. Default

    }),
    unset: 'destroy'

}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());




passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set Cookie Parser, sessions and flash
app.use(cookieParser('NotSoSecret'));
app.use(flash());


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

require('./startup/logging')();
require('./startup/db')();
require("./startup/routes")(app);



app.use('/openai', require('./routes/openaiRoutes'));

app.listen(port, () => console.log(`Server started on port ${port}`));
