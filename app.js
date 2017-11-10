var express = require('express');
//var apiExp = require('expressjs-api-explorer')(app,express);
var swaggerUI = require('express-swagger-explorer')();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var cors = require("cors");

//connect to MongoDB
mongoose.connect('mongodb://localhost/testForAuth', { useMongoClient: true });

var app = express();
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log('db connected!');
});

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// serve static files from template
app.use(express.static(__dirname + '/templateLogReg'));

// include routes
var routes = require('./routes/router');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

//add cors headers
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

app.use('/api-explorer', swaggerUI);

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});

app.options('*', cors()); 

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    next();
});

