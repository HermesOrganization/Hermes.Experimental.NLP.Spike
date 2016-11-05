'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _nodeWit = require('node-wit');

var _nodeWit2 = _interopRequireDefault(_nodeWit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config();

var Wit = _nodeWit2.default.Wit;
var log = _nodeWit2.default.log;

var PORT = process.env.PORT || 8445;

var WIT_TOKEN = process.env.WIT_SERVER_ACCESS_TOKEN;

var FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
if (!FB_PAGE_TOKEN) {
  throw new Error('missing FB_PAGE_TOKEN');
}
var FB_APP_SECRET = process.env.FB_APP_SECRET;
if (!FB_APP_SECRET) {
  throw new Error('missing FB_APP_SECRET');
}

var FB_VERIFY_TOKEN = null;
_crypto2.default.randomBytes(8, function (err, buff) {
  if (err) throw err;
  FB_VERIFY_TOKEN = buff.toString('hex');
  console.log('/webhook will accept the Verify Token "' + FB_VERIFY_TOKEN + '"');
});

var fbMessage = function fbMessage(id, text) {
  var body = JSON.stringify({
    recipient: { id: id },
    message: { text: text }
  });
  var qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
  return (0, _nodeFetch2.default)('https://graph.facebook.com/me/messages?' + qs, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body
  }).then(function (rsp) {
    return rsp.json();
  }).then(function (json) {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    return json;
  });
};

var sessions = {};

var findOrCreateSession = function findOrCreateSession(fbid) {
  var sessionId = void 0;
  Object.keys(sessions).forEach(function (k) {
    if (sessions[k].fbid === fbid) {
      sessionId = k;
    }
  });
  if (!sessionId) {
    sessionId = new Date().toISOString();
    sessions[sessionId] = { fbid: fbid, context: {} };
  }
  return sessionId;
};

var actions = {
  send: function send(_ref, _ref2) {
    var sessionId = _ref.sessionId;
    var text = _ref2.text;

    var recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      return fbMessage(recipientId, text).then(function () {
        return null;
      }).catch(function (err) {
        console.error('Oops! An error occurred while forwarding the response to', recipientId, ':', err.stack || err);
      });
    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      return Promise.resolve();
    }
  }
};

var wit = new Wit({
  accessToken: WIT_TOKEN,
  actions: actions,
  logger: new log.Logger(log.INFO)
});

var app = (0, _express2.default)();
app.use(function (_ref3, rsp, next) {
  var method = _ref3.method,
      url = _ref3.url;

  rsp.on('finish', function () {
    console.log(rsp.statusCode + ' ' + method + ' ' + url);
  });
  next();
});
app.use(_bodyParser2.default.json({ verify: verifyRequestSignature }));

app.get('/webhook', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  if (data.object === 'page') {
    data.entry.forEach(function (entry) {
      entry.messaging.forEach(function (event) {
        if (event.message && !event.message.is_echo) {
          (function () {
            var sender = event.sender.id;
            var sessionId = findOrCreateSession(sender);

            // We retrieve the message content
            var _event$message = event.message,
                text = _event$message.text,
                attachments = _event$message.attachments;


            if (attachments) {
              fbMessage(sender, 'Sorry I can only process text messages for now.').catch(console.error);
            } else if (text) {
              wit.runActions(sessionId, text, sessions[sessionId].context).then(function (context) {
                console.log('Waiting for next user messages');
                sessions[sessionId].context = context;
              }).catch(function (err) {
                console.error('Oops! Got an error from Wit: ', err.stack || err);
              });
            }
          })();
        } else {
          console.log('received event', JSON.stringify(event));
        }
      });
    });
  }
  res.sendStatus(200);
});

function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = _crypto2.default.createHmac('sha1', FB_APP_SECRET).update(buf).digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

app.listen(PORT);
console.log('Listening on :' + PORT + '...');