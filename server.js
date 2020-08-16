require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Connect to database and import functions
const createUser = require('./dbFunctions').createUser;
const getUsers = require('./dbFunctions').getUsers;
require('./dbFunctions').connect(process.env.MONGO_URI);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/hello', (req, res) => {
  res.json({'message': 'Hello'});
});

app.post('/api/exercise/new-user', (req, res) => {
  console.log(req.body.username)
  createUser(req.body.username, (err, data) => {
    if (err) {
      res.json(err)
    } else {
      //console.log(data, Array.isArray(data))
      res.json({'username': data['username'], '_id': data['_id']})
    }
  })
});

app.post('/api/exercise/add', (req, res) => {
  console.log(req.body);
  /*
  {
  userId: 'thisisanid',
  description: 'Some description',
  duration: '30',
  date: '2020-08-16'
  }
  */
});

app.get('/api/exercise/users', (req, res) => {
  getUsers((err, data) => {
    const formattedData = data.map(d => {
      return {'username': d['username'], '_id': d['_id']};
    });
    res.json(formattedData);
  })
})

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'});
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || 'Internal Server Error';
  }
  res.status(errCode).type('txt')
      .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
