
var db = require('./db');

const express = require('express');
var exphbs  = require('express-handlebars');
const app = express();
var helpers = require('./helpers');


var moment = require('moment');

var handlebars = exphbs({defaultLayout: 'main',
  helpers: helpers
});

app.engine('handlebars', handlebars);
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.get('/', function (req, res) {
  db.event.all(function (data) {

    res.render('events', {days:binEvents(data)})
    // res.send(data);
  });
//  res.send('Hello World!');
});

app.get('/boxes', function (req, res) {
  db.event.all(function (data) {
    res.render('boxes', {days:binEvents(data)})
  });
});

app.get('/pages', function (req, res) {
  db.page.all(function (data) {
    res.render('pages', {pages:data})
    // res.send(data);
  });
//  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function binEvents (events) {
  var main = [];
  var lastDay = '';
  var currentDay = null;
  for(var i = 0; i < events.length; i++) {
    var event = events[i];
    event.past = (moment().diff(event.start_time, 'days') > 10);
    if(helpers.month_day(event.start_time) != lastDay) {
      if(currentDay != null) {
        main.push(currentDay);
      }
      lastDay = (helpers.month_day(event.start_time));
      currentDay = {day: lastDay, events: []};
    }
    currentDay.events.push(event);
  }
  if(currentDay != null) {
    main.push(currentDay);
  }

  return main;
}
