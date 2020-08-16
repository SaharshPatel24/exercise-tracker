const mongoose = require('mongoose');

// Schema/Model
const UserSchema = mongoose.Schema({
  username: {type: String, required: true},
});

const User = mongoose.model('User', UserSchema);

const ExerciseSchema = new mongoose.Schema({
  userid: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: {type: Date, required: true},
});

const Exercise = mongoose.model('Exercise', ExerciseSchema);

// Create
const createUser = (userName, cb) => {
  const newUser = new User({username: userName});
  findByUserName(userName, (err, data) => {
    if (err) {
      cb(err, null);
    } else if (data) {
      const err = {Error: 'Username already exists'};
      cb(err, null);
    } else {
      newUser.save((err, data) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, data);
        }
      });
    }
  });
};

const createExercise = ({userId, description, duration, date}, cb) => {
  User.findById(userId, (err, data) => {
    //console.log(`data from db: ${data}`);
    if (err) {
      cb(err, null);
    } else if (data) {
      const userName = data.username;
      const newExercise = new Exercise({
        userid: data._id,
        description: description,
        duration: duration,
        date: date,
      });
      newExercise.save((err, data) => {
        if (err) {
          cb(err, null);
        } else {
          const myData = {
            username: userName,
            _id: data.userid,
            description: data.description,
            duration: data.duration,
            date: data.date,
          };
          cb(null, myData);
        }
      });
    } else {
      // User doesn't exist in User collection
      cb({'Error': 'Unable to create record'}, null);
    }
  });
};
// Read

const findByUserName = (userName, cb) => {
  User.find({username: userName}, (err, data) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, data[0]);
    }
  });
};

const getUsers = (cb) => {
  User.find()
      .sort({username: 'ascending'})
      .exec((err, data) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, data);
        }
      });
};

const getUserById = (userId, cb) => {
  User.findById(userId, (err, data) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, data);
    }
  });
};

const queryExerciseLog = (userId, queryParams = {}, cb) => {

  User.findById(userId, (err, userData) => {
    if (err) {
      cb(err, null);
    } else if (userData) {
      let myQuery = Exercise.find({userid: userData['_id']}).sort({'date': 'ascending'});
      if (queryParams.hasOwnProperty('limit')) {
        myQuery = myQuery.limit(queryParams.limit);
      }
      if (queryParams.hasOwnProperty('from')) {
        myQuery = myQuery.where('date').gte(queryParams.from);
      }
      if (queryParams.hasOwnProperty('to')) {
        myQuery = myQuery.where('date').lt(queryParams.to);
      }

      myQuery.exec((err, logData) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, logData);
        }
      });
    } else {
      // userid doesn't exist in user collection
      cb({'Error': 'No data found'}, null);
    }
  });
};

// Update

// Delete

// Connect to Mongo
const connect = (dbURI) => {
  mongoose.connect(dbURI,
      {useNewUrlParser: true, useUnifiedTopology: true});
};

exports.connect = connect;
exports.createUser = createUser;
exports.createExercise = createExercise;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.queryExerciseLog = queryExerciseLog;
exports.findByUserName = findByUserName;