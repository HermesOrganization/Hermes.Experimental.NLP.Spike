import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';

const PORT =  Number(process.env.PORT || 18000);

const app = express();

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
  res.json({'message': 'Hello World'});
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === "hermes") {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.listen(PORT);

console.log(`localhost:${PORT}`);

process.on('uncaughtException', error => {
  console.log(error);
});
