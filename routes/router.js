var express = require('express');
var router = express.Router();
var User = require('../models/user');

var fs = require("fs");

// GET route for reading data
router.get('/', function (req, res, next) {
  return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});

router.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
  // response.header('Access-Control-Allow-Origin', '*');
  // response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send('<h1>Name: </h1>' + user.username 
                        + '<h2>Mail: </h2>' + user.email 
                        + '<br><a type="button" href="/logout">Logout</a>');
        }
      }
    });
});


// GET list of users
router.get('/listUsers', function (req, res, next) {
  User.find({}).exec(function (error, users) {
      if (error) {
        return next(error);
      }else{
        console.log('-----'+JSON.stringify(users));
        return res.send(users);
        /*var rs = '<h1>Users List </h1><br/>';
        var i = 0;
        while(users.length>i){
          rs = rs + '<h4>'+users[i].email+'</h4>-+-<h4>'+users[i].username+'</h4>';
          i++;
        }
        res.send(rs);*/
      }
    });
});


// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});


// GET json data from a file
router.get('/readJSOn', function (req, res, next) {
	var contents = fs.readFileSync("/NODE-EXPRESS/SHOW/routes/users.json");
	var jsonContent = JSON.parse(contents);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.send(jsonContent);
    
});

// GET for login
router.post('/expresslogin', function (req, res, next) {
  console.log('request....'+JSON.stringify(req.body));
  //res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

  User.findOne({ email: req.body.email })
  .exec(function (err, user) {
    //console.log('144--reponse...'+JSON.stringify(user));
    if (err) {
      return next(err)
    } else if (!user) {
      var err = new Error('User not found.');
      err.status = 401;
      return next(err);
    }else{
      console.log(req.body.password+'152'+user.password);
      if(user.password == req.body.password){
        console.log('login success...151..router.js...');
        return res.send({"status":"success","response":"200"});
      }else{
        return res.send({"status":"fail","response":"420"});
      }
    }
  });
});

module.exports = router;