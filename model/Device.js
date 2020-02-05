const Mongoose = require("mongoose");
const Student = require("./Student.js");
const crypto = require("crypto");
const { authenticator } = require('otplib');

const secret = authenticator.generateSecret(32);

const DeviceSchema = new Mongoose.Schema({
  Model: String,
  Student: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  OTP: {
    Value: Number,
    Expiration: Date
  },
  SIM: {
    Number: String,
    Carrier: String,
  }
});
DeviceSchema.methods.generateOTP = function () {
  var token = authenticator.generate(secret);
  var date = new Date();
  date.setMinutes(date.getMinutes() + 2);
  this.OTP = {
    Value: token,
    Expiration: date
  };
  return token;
};
DeviceSchema.methods.verifyOTP = function (otp) {
  // if(new Date(this.OTP.Expiration).getTime() >= new Date().getTime())
  return authenticator.verify({ token: otp, secret: secret });
  // return false;
};
DeviceSchema.methods.setSecret = function(password) {
  this.Secret.salt = crypto.randomBytes(16).toString('hex');
  this.Secret.hash = crypto.pbkdf2Sync(password, this.Secret.salt, 10000, 512, 'sha512').toString('hex');
};
DeviceSchema.methods.validateSecret = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.Secret.salt, 10000, 512, 'sha512').toString('hex');
  return this.Secret.hash === hash;
};
module.exports = Mongoose.model("Device", DeviceSchema);