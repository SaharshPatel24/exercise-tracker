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

// Update

// Delete

// Connect to Mongo
const connect = (dbURI) => {
  mongoose.connect(dbURI,
      {useNewUrlParser: true, useUnifiedTopology: true});
};

exports.connect = connect;
exports.createUser = createUser;
exports.getUsers = getUsers;
exports.findByUserName = findByUserName;