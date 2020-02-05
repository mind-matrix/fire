const Mongoose = require("mongoose");

const CourseSchema = new Mongoose.Schema({
  Title: String,
  Code: String,
  Faculty: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  RegisteredStudents: [{
    _id: Mongoose.Schema.Types.ObjectId
  }]
}, { timestamps: true });

module.exports = Mongoose.model("Course", CourseSchema);