const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const uniqid = require('uniqid');
const Authorizer = require('./controller/Auth.js');

const { UPLOADS_DIR, MONGODB_SERVER_URL, SERVER_PORT } = require('./constants.js');

const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');
const { Faculty, Student, Device, Room, Feedback } = require('./model');
const path = require('path');

import { express as voyagerMiddleware } from 'graphql-voyager/middleware'

mongoose.connect(MONGODB_SERVER_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, connection }) => {
    if(connection) {
      return connection.context;
    } else {
      const token = req.headers.authorization || false;
      if(token) {
        var client = Authorizer.verify(token);
        return {
          client,
          async uploadFile (stream) {
            
            if(!fs.existsSync(`${UPLOADS_DIR}`)) {
              fs.mkdirSync(`${UPLOADS_DIR}`);
            }

            var id = uniqid();
            var path = `${UPLOADS_DIR}/${id}`;
            const writeStream = fs.createWriteStream(path);
            await new Promise((resolve, reject) => {
              writeStream.on('finish', resolve);
              writeStream.on('error', error => {
                fs.unlink(path, () => {
                  reject(error)
                });
              });
              stream.on('error', error => writeStream.destroy(error));
              stream.pipe(writeStream);
            });
            return id;
          }
        };
      }
      return {};
    }
  }
});

server.subscriptionServerOptions.onDisconnect = async (ws, context) => {
  if (context.client) {
    if(context.client === 'faculty') {
      // handle for faculty
    } else {
      // handle for student
      var student = await Student.findOne({ _id: context.client._id });
      student.Active = false;
      if(student.LastSeatInfo && student.LastSeatInfo.Room) {
        var room = await Room.findOne({ _id: student.LastSeatInfo.Room._id });
        room.Layout[event.Data.Row][event.Data.Column].Occupant = null;
        room.Layout = JSON.parse(JSON.stringify(room.Layout));
        room.save();
      }
      student.save();
    }
  }
};

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(compression());

app.use(express.static('public'));

app.get('/susreport/basic', async (req, res) => {
  let feedbacks = await Feedback.find({});
  let average = feedbacks.reduce((a, v) => a + v, 0) / feedbacks.length;
  let count = feedbacks.length;
  let severity = ( average >= 80.3 ) ? 'A' : (average >= 68) ? 'B' : (average > 51) ? 'C' : 'F';
  res.send({
    average,
    count,
    severity
  })
});

app.get('/susreport/advanced', async (req, res) => {
  let feedbacks = await Feedback.find({});
  let details = {
    individual_averages: feedbacks.reduce((a, v, i) => {
        a[i] += v[i];
      }, Array(10).fill(0)).map((v) => v / feedbacks.length),
    count: {
      student: feedbacks.filter((v) => v.Account.Type === "Student").length,
      faculty: feedbacks.filter((v) => v.Account.Type === "Faculty").length
    }
  };
  let average = feedbacks.reduce((a, v) => a + v, 0) / feedbacks.length;
  let count = feedbacks.length;
  let severity = ( average >= 80.3 ) ? 'A' : (average >= 68) ? 'B' : (average > 51) ? 'C' : 'F';
  res.send({
    average,
    count,
    severity,
    details
  });
});

app.get('/document', async (req, res) => {
  var id = req.query.id;
  if(id) {
    var path = `${UPLOADS_DIR}/${id}`;
    if(fs.existsSync(path)) {
      res.sendFile(path, { root: __dirname });
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(400);
  }
});

app.post('/faculty/login', async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var faculty = await Faculty.findOne({ Username: username });
  if(faculty) {
    if(faculty.validatePassword(password)) {
      res.send({
        token: Authorizer.sign({
          type: 'faculty',
          _id: faculty._id
        })
      });
    } else {
      res.send({ error: "Invalid username or password" });
    }
  } else {
    res.send({ error: "No such account exists" });
  }
});

app.post('/faculty/signup', async (req, res) => {
  var name = req.body.name;
  var username = req.body.username;
  var password = req.body.password;
  if(! await Faculty.exists({ username: username })) {
    var faculty = new Faculty({
      Name: name,
      Username: username
    });
    faculty.setPassword(password);
    faculty.save();
    res.send({
      token: Authorizer.sign({
        type: 'faculty',
        _id: faculty._id
      })
    });
  } else {
    res.send({ error: "A faculty with this username already exists" });
  }
});

app.get('/faculty/validateUsername', async (req, res) => {
  var username = req.query.username;
  if(await Faculty.exists({ username: username })) {
    res.send({ valid: false });
  } else {
    res.send({ valid: true });
  }
});

app.post('/student/register', async (req, res) => {
  var name = req.body.name;
  var identifier = req.body.identifier;
  var email = req.body.email || null;
  var deviceInfo = req.body.device;
  var student = new Student({
    Name: name,
    Email: email,
    Identifier: identifier,
    RegisteredCourses: []
  });
  var device = new Device({
    DeviceModel: deviceInfo.model,
    Student: {
      _id: student._id
    },
    SIM: {
      Number: deviceInfo.number,
      Carrier: deviceInfo.carrier || 'Unknown'
    }
  });
  student.Device = {
    _id: device._id
  };
  await device.save();
  await student.save();
  var otp = device.generateOTP();
  /* Authorizer.sendOTP(otp, deviceInfo.number).then(() => {
    res.send({
      created: true,
      otp: otp
    });
  }).catch((e) => {
    res.send({
      error: e
    })
  }); */
  res.send({
    created: true,
    otp: otp
  });
});

app.post('/student/request', async (req, res) => {
  var identifier = req.body.identifier;
  var student = await Student.findOne({
    Identifier: identifier
  });
  if(student) {
    var device = await Device.findOne({ _id: student.Device._id }, { OTPSecret: 1 });
    var otp = device.generateOTP();
    /* Authorizer.sendOTP(otp, deviceInfo.number).then(() => {
      res.send({
        created: true,
        otp: otp
      });
    }).catch((e) => {
      res.send({
        error: e
      })
    }); */
    res.send({
      created: true,
      otp: otp
    });
  } else {
    res.send({ error: "No such account exists" });
  }
});

app.post('/student/login', async (req, res) => {
  var otp = req.body.otp;
  var identifier = req.body.identifier;
  var student = await Student.findOne({ Identifier: identifier });
  if(student) {
    var device = await Device.findOne({ _id: student.Device._id }, { OTPSecret: 1 });
    if(device.verifyOTP(otp)) {
      res.send({
        token: Authorizer.sign({
          type: 'student',
          _id: student._id
        })
      });
    } else {
      res.send({ error: "OTP invalid or past expiration" });
    }
  } else {
    res.send({ error: "No such account exists" })
  }
});

app.use('/docs', voyagerMiddleware({ endpointUrl: '/graphql' }));

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(SERVER_PORT, () => {
  console.log(`Server running at ${ server.graphqlPath }`);
  console.log(`Subscription Server running at ${ server.subscriptionsPath }`);
});