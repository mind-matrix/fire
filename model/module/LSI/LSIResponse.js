const Mongoose = require("mongoose");

const LSIResponseSchema = new Mongoose.Schema({
  Student: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Responses: [Number],
  Score: Mongoose.Schema.Types.Mixed,
  Category: Mongoose.Schema.Types.Mixed
});

module.exports = Mongoose.model("LSIResponse", LSIResponseSchema);