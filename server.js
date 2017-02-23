'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var validator = require('./validator');
var randomToken = require('./tokengenerator.js');
var users = require('./users.json');
var feeds = require('./feed.json');
var subscriptions = require('./subscriptions.json');
var fs = require('fs');

var cors = require('cors');


var app = express();

app.use(cors());
app.use(bodyParser.json());

////////////////  LOG IN  ////////////////

app.post('/user/login', function (req, res) {
  var email = req.body.email;
  console.log(req.body.email)
  var password = req.body.password;
  var checkResult = validator(email, password);
  if (checkResult.value) {
      var response = {
        result: 'success',
        token: randomToken(),
        id: checkResult.id,
      };
  } else {
      var response = {
        result: 'fail',
        message: 'invalid username or password',
        
      };
  }
  res.send(response);
});

////////////////  SIGN UP  ////////////////

app.post('/user/signup', function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var checkResult = validator(email, password);
  if (checkResult.value) {
    var response = {
      result: 'fail',
      message: 'Email address already exists',
    };
  } else {
    var id = users.length + 1;
    var user = {
      email: req.body.email,
      password: req.body.password,
      id: id
    }
    users.push(user);
    fs.writeFile('users.json', JSON.stringify(users));
    var response = {
      result: 'success',
      token: randomToken(),
      id: id,
    };
  }
  res.send(response);
});

////////////////  LIST FEED  ////////////////

app.get('/feed', function (req, res) {
  res.send({feed: feeds});
});


app.get('/feed/:id', function (req, res) {
  var id = req.params.id;
  var response = [];
  var feed = {};

  feeds.forEach(function (element) {
    if (element.feed_id == id) {
      response.push(element);
    }
  });
  res.send(response);
});

app.put('/feed/:id', function (req, res) {
  var id = req.params.id;
  var response = [];
  feeds.forEach(function (element) {
    if (element.id === parseInt(id)) {
      element.opened = true;

    }
  });
  fs.writeFile('feed.json', JSON.stringify(feeds));
  response = { response : 'success'}
  res.send(response);
});
////////////////  Favorites  ////////////////

app.get('/favorites', function (req, res) {
  var response = [];
  var feed = {};

  feeds.forEach(function (element) {
    if (element.favorite) {
      response.push(element);
    }
  });
  res.send(response);
});

app.put('/favorites', function (req, res) {
  var id = req.body.item_id;
  var response = [];
  feeds.forEach(function (element) {
    if (element.id === id) {
      element.favorite = !element.favorite
    }
  });
  fs.writeFile('feed.json', JSON.stringify(feeds));
  response = { response : 'success'}
  res.send(response);
});


////////////////  LIST SUBSCRIPTION  ////////////////

app.get('/subscription', function (req, res) {
  var response = subscriptions;
  res.send(response);
});

////////////////  ADD SUBSCRIPTION  ////////////////

app.post('/subscribe', function (req, res) {
  var name = req.body.feed;
  var id = subscriptions.length + 1;
  var subscription = {
      id: id,
      name: req.body.feed
    }
  subscriptions.push(subscription);
  fs.writeFile('subscriptions.json', JSON.stringify(subscriptions));
  var response = {
    result: 'success',
    id: id
    };
  res.send(response);
});

///////////////  DELETE SUBSCRIPTION  ////////////////

app.del('/subscribe/:id', function (req, res) {
  console.log(req.params.id);
  var id = req.params.id;
  subscriptions.forEach(function(element){
    if ( element.id == id ){
      subscriptions.splice(subscriptions.indexOf(element), 1);
    }
  })
  fs.writeFile('subscriptions.json', JSON.stringify(subscriptions));
  var response = {
    result: 'success',
    id: id
    };
  res.send(response);
});

//////////////////////



/////////////////////////////


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
