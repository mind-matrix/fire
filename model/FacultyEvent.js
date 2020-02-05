const Mongoose = require('mongoose');

const FacultyEventSchema = new Mongoose.Schema({
  Descriptor: { type: String },
  Data: { type: Mongoose.Schema.Types.Mixed },
  Faculty: {
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

module.exports = Mongoose.model("FacultyEvent", FacultyEventSchema);