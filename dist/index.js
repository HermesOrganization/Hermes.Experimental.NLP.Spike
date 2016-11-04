'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var HermesNLP = function () {
  function HermesNLP() {
    _classCallCheck(this, HermesNLP);

    return "Hermes NLP";
  }

  _createClass(HermesNLP, [{
    key: 'receivedMessage',
    value: function receivedMessage(event) {
      var senderID = event.sender.id;
      var recipientID = event.recipient.id;
      var timeOfMessage = event.timestamp;
      var message = event.message;

      console.log("Received message for user %d and page %d at %d with message: ", senderID, recipientID, timeOfMessage);
      console.log(JSON.stringify(message));

      var messageId = message.mid;
      var messageText = message.text;
      var messageAttachments = message.attachments;

      if (messageText) {
        switch (messageText) {
          case 'generic':
            sendGenericMessage(senderID);
            break;

          default:
            sendTextMessage(senderID, messageText);
        }
      } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
      }
    }
  }, {
    key: 'sendGenericMessage',
    value: function sendGenericMessage(recipientId, messageText) {}
  }, {
    key: 'sendTextMessage',
    value: function sendTextMessage(recipientId, messageText) {
      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          text: messageText
        }
      };

      callSendAPI(messageData);
    }
  }, {
    key: 'callSendAPI',
    value: function callSendAPI(messageData) {
      request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: 'EAANRZBVDu9vABAMAFpwvtEMaPixOKndOmo2yPREZApvsleMlmgY6cLKD1A7MfegFyELRvYz7ZBjgjpKiKRtsYBdY1YAClFg62CTcI5dWbp6nK5FusyKRx2wrHCZBhS9gH6piPOKDx56CkRBBE8Tl9I8gtGSAByyV4yBDJxqBNLYV6pwJZBhg9' },
        method: 'POST',
        json: messageData
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var recipientId = body.recipient_id;
          var messageId = body.message_id;
          console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
        } else {
          console.error("Unable to send message.");
          console.error(response);
          console.error(error);
        }
      });
    }
  }]);

  return HermesNLP;
}();

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