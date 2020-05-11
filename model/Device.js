const Mongoose = require("mongoose");
const Student = require("./Student.js");
const { authenticator } = require('otplib');

const DeviceSchema = new Mongoose.Schema({
  Model: String,
  Student: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  SIM: {
    Number: String,
    Carrier: String,
  },
  OTPSecret: {
    type: String,
    default: function () {
      return authenticator.generateSecret(32);
    },
    select: false
  }
});
DeviceSchema.methods.generateOTP = function () {
  return authenticator.generate(this.OTPSecret);
};
DeviceSchema.methods.verifyOTP = function (otp) {
  return authenticator.check(otp, this.OTPSecret);
};
module.exports = Mongoose.model("Device", DeviceSchema);