const jwt = require('jsonwebtoken');
const fs = require('fs');
const Twilio = require('twilio');

var publicKey = fs.readFileSync('./public.key', { encoding: 'utf-8' });
var privateKey = fs.readFileSync('./private.key', { encoding: 'utf-8' });

var twilioSID = fs.readFileSync('./twilio.sid', { encoding: 'utf-8' });
var twilioToken = fs.readFileSync('./twilio.token', { encoding: 'utf-8' });

const twilioClient = Twilio(twilioSID, twilioToken);

var defaultOptions = {
  issuer: 'FIRE',
  subject: '',
  audience: '',
  expiresIn: "30d",
  algorithm: "RS256"
};

module.exports = {
  sign: (payload, $Options = {}) => {
    var signOptions = {
      issuer: $Options.issuer || defaultOptions.issuer,
      subject: $Options.subject || defaultOptions.subject,
      audience: $Options.audience || defaultOptions.issuer,
      expiresIn: $Options.expiresIn || defaultOptions.expiresIn,
      algorithm: $Options.algorithm || defaultOptions.algorithm
    }
    return jwt.sign(payload, privateKey, signOptions);
  },
  verify: (token, $Options = {}) => {
    var verifyOptions = {
      issuer: $Options.issuer || defaultOptions.issuer,
      subject: $Options.subject || defaultOptions.subject,
      audience: $Options.audience || defaultOptions.issuer,
      expiresIn: $Options.expiresIn || defaultOptions.expiresIn,
      algorithm: [$Options.algorithm || defaultOptions.algorithm]
    }
    try {
      return jwt.verify(token, publicKey, verifyOptions);
    } catch (err) {
      return false;
    }
  },
  decode: (token) => {
    return jwt.decode(token, { complete: true });
  },
  sendOTP: async (otp, number) => {
    return await twilioClient.messages.create({
      body: `${otp}`,
      from: '+12562570929',
      to: number
    });
  }
};