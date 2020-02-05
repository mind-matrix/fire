const Mongoose = require("mongoose");

const LSISchema = new Mongoose.Schema({
  Faculty: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Responses: [{
    _id: Mongoose.Schema.Types.ObjectId
  }]
});

module.exports = Mongoose.model("LSI", LSISchema);