const Mongoose = require("mongoose");
const Faculty = require("./Faculty.js");
const Task = require("./Task.js");
const RoomSchema = new Mongoose.Schema({
  Name: String,
  Capacity: Number,
  Layout: [[{
    Seat: {
      type: Boolean,
      default: false
    },
    Occupant: {
      _id: Mongoose.Schema.Types.ObjectId
    }
  }]],
  Available: {
    type: Boolean,
    default: true
  },
  Usage: {
    Faculty: {
      _id: Mongoose.Schema.Types.ObjectId
    },
    Task: {
      _id: Mongoose.Schema.Types.ObjectId
    },
  },
});
RoomSchema.methods.Usage_getFaculty = function(_id) {
  return Faculty.findOne({
    _id
  });
};
RoomSchema.methods.Usage_getTask = function(_id) {
  return Task.findOne({
    _id
  });
};
module.exports = Mongoose.model("Room", RoomSchema);