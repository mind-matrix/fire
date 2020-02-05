const Mongoose = require("mongoose");

const LectureSchema = new Mongoose.Schema({
  Course: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Start: Mongoose.Schema.Types.Date,
  End: Mongoose.Schema.Types.Date,
  Faculty: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Students: [{
    _id: { type: Mongoose.Schema.Types.ObjectId }
  }],
  StudentEvents: [{
    _id: { type: Mongoose.Schema.Types.ObjectId }
  }],
  FacultyEvents: [{
    _id: { type: Mongoose.Schema.Types.ObjectId }
  }]
});

module.exports = Mongoose.model("Lecture", LectureSchema)