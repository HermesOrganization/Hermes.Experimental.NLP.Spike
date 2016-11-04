'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PORT = Number(process.env.PORT || 18000);

var app = (0, _express2.default)();

var HermesNLP = function HermesNLP() {
  _classCallCheck(this, HermesNLP);

  return "Hermes NLP";
};

var hermes = new HermesNLP();

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
  res.json({ 'message': hermes });
});

app.get('/webhook', function (req, res) {
  var data = req.body;

  if (data.object === 'page') {
    res.json({ 'message': data });
  }
});

app.listen(PORT);

console.log('localhost:' + PORT);

process.on('uncaughtException', function (error) {
  console.log(error);
});