const Mongoose = require("mongoose");

const LSISchema = new Mongoose.Schema({
  Faculty: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Students: [{
    _id: { type: Mongoose.Schema.Types.ObjectId }
  }],
  StudentEvents: [{
    _id: { type: Mongoose.Schema.Types.ObjectId }
  }],
  Responses: [{
    _id: Mongoose.Schema.Types.ObjectId
  }]
});

LSISchema.virtual('Type').get(function () {
  return 'LSI';
})

module.exports = Mongoose.model("LSI", LSISchema);