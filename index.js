import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';

const PORT =  Number(process.env.PORT || 18000);

const app = express();




  function receivedMessage (event) {
    let senderID = event.sender.id;
    let recipientID = event.recipient.id;
    let timeOfMessage = event.timestamp;
    let message = event.message;

    console.log("Received message for user %d and page %d at %d with message: ", senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    let messageId = message.mid;
    let messageText = message.text;
    let messageAttachments = message.attachments;

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

  function sendGenericMessage (recipientId, messageText) {

  }

  function sendTextMessage (recipientId, messageText) {
    let messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: messageText
      }
    };

    callSendAPI(messageData);
  }

  function callSendAPI (messageData) {
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


app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log("%s %s", req.method, req.url);
  console.log(req.body);
  next();
});

app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.get('/', (req, res) => {
  res.json({'message': "Hermes.Experimental.NLP.Spike"});
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === "hermes") {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  var data = req.body;

  if (data.object === 'page') {
    data.entry.forEach(function (entry) {
      let pageID = entry.id;
      let timeOfEvent = entry.time;

      entry.messaging.forEach(function (event) {
        if (event.message) {
          console.log(event.message);
          receivedMessage(event);
        } else {
          console.log('Webhook received unknown event: ', event);
        }
      });
    });
  }
  res.sendStatus(200);
});

app.listen(PORT);

console.log(`localhost:${PORT}`);

process.on('uncaughtException', error => {
  console.log(error);
});

