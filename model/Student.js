const Mongoose = require("mongoose");
const Devices = require("./Device.js");
const StudentSchema = new Mongoose.Schema({
  Name: String,
  Email: String,
  Identifier: String,
  Device: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Active: Boolean,
  LastSeatInfo: {
    Room: { _id: Mongoose.Schema.Types.ObjectId },
    Row: Number,
    Column: Number,
    Course: { _id: Mongoose.Schema.Types.ObjectId }
  },
  SeatingHistory: [{
    Room: { _id: Mongoose.Schema.Types.ObjectId },
    Row: Number,
    Column: Number,
    Course: { _id: Mongoose.Schema.Types.ObjectId }
  }],
  RegisteredCourses: [{
    _id: Mongoose.Schema.Types.ObjectId
  }],
  DisplayPicture: Mongoose.Schema.Types.Mixed,
  ModuleData: {
    type: Mongoose.Schema.Types.Mixed
  }
});
StudentSchema.methods.getDevices = function(_id) {
  return Devices.findOne({
    _id
  });
};
module.exports = Mongoose.model("Student", StudentSchema);