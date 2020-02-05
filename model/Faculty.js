const Mongoose = require("mongoose");
const crypto = require("crypto");
const FacultySchema = new Mongoose.Schema({
  Name: String,
  Username: String,
  Password: {
    hash: String,
    salt: String
  },
  DisplayPicture: Mongoose.Schema.Types.Mixed,
});
FacultySchema.methods.setPassword = function(password) {
  this.Password.salt = crypto.randomBytes(16).toString('hex');
  this.Password.hash = crypto.pbkdf2Sync(password, this.Password.salt, 10000, 512, 'sha512').toString('hex');
};
FacultySchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.Password.salt, 10000, 512, 'sha512').toString('hex');
  return this.Password.hash === hash;
};
module.exports = Mongoose.model("Faculty", FacultySchema);