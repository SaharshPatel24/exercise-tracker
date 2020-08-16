require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Connect to database and import functions
const createUser = require('./dbFunctions').createUser;
const getUsers = require('./dbFunctions').getUsers;
const getUserById = require('./dbFunctions').getUserById;
const createExercise = require('./dbFunctions').createExercise;
const getExercisesByUserId = require('./dbFunctions').getExercisesByUserId;
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
  createUser(req.body.username, (err, data) => {
    if (err) {
      res.json(err);
    } else {
      //console.log(data, Array.isArray(data))
      res.json({'username': data['username'], '_id': data['_id']});
    }
  });
});

app.get('/api/exercise/users', (req, res) => {
  getUsers((err, data) => {
    if (err) {
      res.json(err);
    } else {
      const formattedData = data.map(d => {
        return {'username': d['username'], '_id': d['_id']};
      });
      res.json(formattedData);
    }
  });
});

app.post('/api/exercise/add', (req, res) => {
  console.log(req.body);
  const exercise = req.body;
  if (!exercise['userId']) {
    res.json({'Error': 'No userid in request'});
  } else if (!exercise['description']) {
    res.json({'Error': 'No description in request'});
  } else if (!exercise['duration']) {
    res.json({'Error': 'No duration in request'});
  } else {
    if (!exercise['date']) {
      exercise['date'] = new Date();
    } else {
      exercise['date'] = new Date(exercise['date']);
      if (exercise['date'].toString() === 'Invalid Date') {
        res.json({'Error': 'Invalid Date specified in request'});
      }
    }
    exercise['duration'] = +exercise['duration'];
    if (Number.isNaN(exercise['duration'])) {
      res.json({'Error': 'Invalid duration specified in request'});
    }
    createExercise(exercise, (err, data) => {
      if (err) {
        res.json(err);
      } else {
        console.log(data);
        res.json(data);
      }
    });
  }
});

app.get('/api/exercise/log', (req, res) => {
  /*
  /api/exercise/log?userId=something&from=something&to=something&limit=something
  */
  console.log(req.query);
  // Add checks for values
  getUserById(req.query.userId, (err, userData) => {
    if (err) {
      res.json(err)
    } else {
      getExercisesByUserId(req.query.userId, (err, data) => {
        if (err) {
          res.json(err);
        } else {
          //  Return will be the user object with added array log and count (total exercise count)
          const response = {
            username: userData.username,
            _id: userData._id,
            log: data.map(d => {
              return ({
                description: d.description,
                duration: d.duration,
                date: d.date
              })
            }),
            count: data.length
          }
          res.json(response);
        }
      });
    }
  });
});

// Not found middleware
app.use((req, res, next) => {
  console.log(req.path);
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
