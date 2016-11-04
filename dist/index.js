'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORT = Number(process.env.PORT || 18000);

var app = (0, _express2.default)();

app.use(_bodyParser2.default.urlencoded({
  extended: true
}));

app.use(_bodyParser2.default.json());

app.use(function (req, res, next) {
  console.log("%s %s", req.method, req.url);
  console.log(req.body);
  next();
});

app.use((0, _errorhandler2.default)({
  dumpExceptions: true,
  showStack: true
}));

app.get('/', function (req, res) {
  res.json({ 'message': 'Hello World' });
});

app.get('/webhook', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === "hermes") {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.listen(PORT);

console.log('localhost:' + PORT);

process.on('uncaughtException', function (error) {
  console.log(error);
});