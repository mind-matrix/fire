const Mongoose = require("mongoose");

const CrowdTestSchema = new Mongoose.Schema({
  Faculty: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Questions: [{
    _id: Mongoose.Schema.Types.ObjectId
  }],
  Start: {
    type: Mongoose.Schema.Types.Date
  },
  End: {
    type: Mongoose.Schema.Types.Date
  },
  Dispatch: {
    type: Mongoose.Schema.Types.Date
  },
  Responses: [{
    _id: Mongoose.Schema.Types.ObjectId
  }]
});

module.exports = Mongoose.model("CrowdTest", CrowdTestSchema);