const Mongoose = require("mongoose");

const CrowdTestSchema = new Mongoose.Schema({
  Faculty: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Students: [{
    _id: { type: Mongoose.Schema.Types.ObjectId }
  }],
  StudentEvents: [{
    _id: { type: Mongoose.Schema.Types.ObjectId }
  }],
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
  Dispatched: {
    type: Boolean,
    default: false
  },
  Responses: [{
    _id: Mongoose.Schema.Types.ObjectId
  }]
});

CrowdTestSchema.virtual('Type').get(function () {
  return 'CrowdTest';
})

module.exports = Mongoose.model("CrowdTest", CrowdTestSchema);