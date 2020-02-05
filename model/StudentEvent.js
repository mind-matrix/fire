const Mongoose = require('mongoose');

const StudentEventSchema = new Mongoose.Schema({
  Descriptor: { type: String },
  Data: { type: Mongoose.Schema.Types.Mixed },
  Student: {
    _id: { type: Mongoose.Schema.Types.ObjectId }
  },
  Document: {
    filename: String,
    mimetype: String,
    encoding: String,
    id: String
  },
  Timestamp: { type: Mongoose.Schema.Types.Date }
});

module.exports = Mongoose.model("StudentEvent", StudentEventSchema);