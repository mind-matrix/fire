const Mongoose = require("mongoose");
const TaskSchema = new Mongoose.Schema({
  Module: String,
  Faculty: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Room: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Start: Mongoose.Schema.Types.Date,
  End: Mongoose.Schema.Types.Date,
  State: Mongoose.Schema.Types.Mixed,
  ObjectReferenceId: Mongoose.Schema.Types.ObjectId,
});
module.exports = Mongoose.model("Task", TaskSchema);