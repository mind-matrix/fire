const { gql, PubSub, withFilter } = require('apollo-server-express');
const { merge } = require('lodash');
const { GraphQLDateTime } = require('graphql-iso-date');
const { GraphQLJSON } = require('graphql-type-json');

const { Student, Faculty, Room, Course, Task, Module, StudentEvent, FacultyEvent } = require('../model');

import { typeDefs as studentTypeDefs, resolvers as studentResolvers } from './types/Student.js';
import { typeDefs as courseTypeDefs, resolvers as courseResolvers } from './types/Course.js';
import { typeDefs as roomTypeDefs, resolvers as roomResolvers } from './types/Room.js';
import  { typeDefs as facultyTypeDefs, resolvers as facultyResolvers } from './types/Faculty.js';
import { typeDefs as deviceTypeDefs, resolvers as deviceResolvers } from './types/Device.js';
import { typeDefs as taskTypeDefs, resolvers as taskResolvers } from './types/Task.js';
import  { typeDefs as moduleDataTypeDefs, resolvers as moduleDataResolvers } from './types/ModuleData.js';
import { typeDefs as moduleTypeDefs, resolvers as moduleResolvers, eventCallbacks as moduleEventCallbacks } from './types/Modules.js';

import { EVENT_ADDED, EVENT_UPDATED, EVENT_DELETED, EVENT_QUESTION_BATCH, ROOM_ADDED, ROOM_REMOVED, ROOM_UPDATED, TASK_UPDATE } from '../constants.js';

const pubsub = new PubSub();

const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type UpdateAccount {
    Name: String
    DisplayPicture: Document
  }

  input UpdateAccountInput {
    Name: String
    DisplayPicture: Upload
  }

  type LastSeatInfo {
    Room: Room
    Row: Int
    Column: Int
    Course: Course
  }

  type Query {
    Student: Student!
    AllStudents: [Student!]!
    RegisteredStudents (Course_id: ID!): [Student!]!
    Faculty: Faculty!
    Room (_id: ID, Name: String, Course_id: ID): Room!
    AllRooms: [Room]
    AvailableRooms: [Room]
    Course (_id: ID, Code: String): Course!
    AllCourses: [Course]
    Task (_id: ID!): Task!
    AllTasks: [Task]
    RunningTasks: [Task]
    LastSeat(Course_id: ID): LastSeatInfo
  }

  type Mutation {
    Update(input: UpdateAccountInput!): UpdateAccount!
    AddRoom (input: AddRoomInput!): Room!
    UpdateRoom (_id: ID!, input: UpdateRoomInput!): Room!
    RemoveRoom (_id: ID!): Room!
    AddCourse (input: AddCourseInput!): Course!
    UpdateCourse (_id: ID!, input: UpdateCourseInput!): Course!
    RemoveCourse (_id: ID!): Course!
    AddTask (input: TaskInput!): Task!
    PauseTask (_id: ID!): Task!
    ResumeTask (_id: ID!): Task!
    StopTask (_id: ID!): Task!
    RegisterStudents (input: RegisterStudentsInput!): [Student!]!
    AddEvent(Task_id: ID!, input: AddEventInput!): Event!
  }

  type Subscription {
    taskSub: Task
    eventSub: Event
    roomSub (_id:ID): Room
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`;

const resolvers = {
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
  Query: {
    async Student (parent, args, context, info) {
      if (context.client && context.client.type === 'student')
        return Student.findOne({ _id: context.client._id });
    },
    async AllStudents(parent, args, context, info) {
      if(context.client && context.client.type === 'faculty')
        return Student.find({});
    },
    async RegisteredStudents (parent, args, context, info) {
      if(context.client && context.client.type === 'faculty')
        return Student.find({ RegisteredCourses: { _id: args.Course_id } });
    },
    async Faculty (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty')
        return Faculty.findOne({ _id: context.client._id });
    },
    async Room (parent, args, context, info) {
      return Room.findOne(args);
    },
    async Course (parent, args, context, info) {
      return await Course.findOne(args);
    },
    async Task (parent, args, context, info) {
      return Task.findOne(args);
    },
    async AllRooms (parent, args, context, info) {
      return await Room.find({});
    },
    async AvailableRooms (parent, args, context, info) {
      return await Room.find({ Available: true });
    },
    async AllCourses (parent, args, context, info) {
      return await Course.find({});
    },
    async AllTasks (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty')
        return await Task.find({ "Faculty._id": context.client._id });
    },
    async RunningTasks (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty')
        return await Task.find({ State: { $ne: "FINISHED" }, "Faculty._id": context.client._id });
    },
    async LastSeat (parent, args, context, info) {
      if(context.client && context.client.type === 'student') {
        var student = await Student.findOne({ _id: context.client._id });
        let lastSeat = null;
        if(args.Course_id) {
          for(var seat of student.SeatingHistory) {
            if(seat.Course && seat.Course._id === args.Course_id) {
              lastSeat = seat;
            }
          }
        } else {
          lastSeat = student.SeatingHistory[student.SeatingHistory.length - 1];
        }
        return {
          Room: await Room.findOne({ _id: lastSeat.Room._id }),
          Row: lastSeat.Row,
          Column: lastSeat.Column,
          Course: (lastSeat.Course) ? await Course.findOne({ _id: lastSeat.Course._id }) : null
        };
      }
    }
  },
  Mutation: {
    async Update (parent, args, context, info) {
      if (context.client) {
        if(args.input.DisplayPicture) {
          var { createReadStream, filename, mimetype, encoding } = await args.input.DisplayPicture;
          var fileid = await context.uploadFile(createReadStream());
          args.input.DisplayPicture = {
            filename: filename,
            mimetype: mimetype,
            encoding: encoding,
            id: fileid
          };
        }
        if (context.client.type === 'faculty') {
          await Faculty.findOneAndUpdate({ _id: context.client._id }, args.input);
        } else {
          await Student.findOneAndUpdate({ _id: context.client._id }, args.input);
        }
        return args.input;
      }
    },
    async AddRoom (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty') {
        args.input.Capacity = args.input.Layout.reduce( (a, i) => a + i.filter(j => j.Seat).length, 0);
        let room = new Room(args.input);
        pubsub.publish(ROOM_ADDED, { roomSub: room });
        return room.save();
      }
    },
    async UpdateRoom (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty') {
        var room = Room.findOneAndUpdate(args._id, args.input);
        pubsub.publish(ROOM_UPDATED, { roomSub: room });
        return room;
      }
    },
    async RemoveRoom (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty') {
        var room = Room.findOneAndDelete({ _id: args._id });
        pubsub.publish(ROOM_REMOVED, { roomSub: room });
        return room;
      }
    },
    async AddCourse (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty') {
        args.input.Faculty = {
          _id: context.client._id
        };
        args.input.RegisteredStudents = [];
        let course = new Course(args.input);
        return course.save();
      }
    },
    async UpdateCourse (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty')
        return Course.findOneAndUpdate({ _id: args._id}, args.input);
    },
    async RemoveCourse (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty')
        return Course.findOneAndDelete({ _id: args._id });
    },
    async AddTask (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty') {
        let room = await Room.findOne({ _id: args.input.Room_id });
        let moduleInstance = new Module[args.input.Module][args.input.Module]({
          Course: {
            _id: args.input.Course_id
          },
          Faculty: {
            _id: context.client._id
          }
        });
        let task = new Task({
          Module: args.input.Module,
          Start: new Date(),
          Faculty: {
            _id: context.client._id
          },
          Room: {
            _id: args.input.Room_id
          },
          State: 'RUNNING',
          ObjectReferenceId: moduleInstance._id
        });
        room.Available = false;
        room.Usage = {
          Faculty: {
            _id: context.client._id
          },
          Task: {
            _id: task._id
          }
        };
        pubsub.publish(ROOM_UPDATED, { roomSub: await room.save() });
        moduleInstance.save();
        pubsub.publish(TASK_UPDATE, { taskSub: task });
        return task.save();
      }
    },
    async PauseTask (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty') {
        let task = await Task.findOne({ _id: args._id, "Faculty._id": context.client._id });
        if (task && task.State === 'RUNNING') {
          // PAUSE TASK ACTIONS
          task.State = "PAUSED";
          pubsub.publish(TASK_UPDATE, { taskSub: task });
        }
        return task.save();
      }
    },
    async ResumeTask (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty') {
        let task = await Task.findOne({ _id: args._id, "Faculty._id": context.client._id });
        if (task && task.State === 'PAUSED') {
          // RESUME TASK ACTIONS
          task.State = "RUNNING";
          pubsub.publish(TASK_UPDATE, { taskSub: task });
        }
        return task.save();
      }
    },
    async StopTask (parent, args, context, info) {
      if (context.client && context.client.type === 'faculty') {
        let task = await Task.findOne({ _id: args._id, "Faculty._id": context.client._id });
        let room = await Room.findOne({ _id: task.Room._id });
        if (task && task.State === 'RUNNING') {
          // STOP TASK ACTIONS
          for(var i=0; i < room.Layout.length; i++) {
            for(var j=0; j < room.Layout[i].length; j++) {
              if(room.Layout[i][j].Occupant !== null) {
                room.Layout[i][j].Occupant = null;
              }
            }
          }
          room.Layout = JSON.parse(JSON.stringify(room.Layout));
          room.Available = true;
          room.Usage = null;
          pubsub.publish(ROOM_UPDATED, { roomSub: await room.save() });
          task.State = "FINISHED";
          pubsub.publish(TASK_UPDATE, { taskSub: task });
        }
        return task.save();
      }
    },
    async RegisterStudents (parent, args, context, info) {
      let students = await args.input.Student_ids.map(async (v) => await Student.findOne({ _id: v }));
      let course = await Course.findOne({ _id: args.input.Course_id });
      if (students.length && course) {
        students.forEach((student, index) => {
          student.RegisteredCourses.push({ _id: course._id });
          student.save();
        });
        course.RegisteredStudents.push(...students.map(v => ({ _id: v._id }) ));
        course.save();
        return students;
      }
    },
    async AddEvent (parent, args, context, info) {
      if(context.client) {
        var type = context.client.type;
        var id = context.client._id;
        var task = await Task.findOne({ _id: args.Task_id });
        if(args.input.Document) {
          var { createReadStream, filename, mimetype, encoding } = await args.input.Document;
          var fileid = await context.uploadFile(createReadStream());
          args.input.Document = {
            filename: filename,
            mimetype: mimetype,
            encoding: encoding,
            id: fileid
          };
        }
        if(type === 'faculty') {
          var event = await FacultyEvent.create({
            Descriptor: args.input.Descriptor,
            Data: args.input.Data,
            Faculty: {
              _id: id
            },
            Document: args.input.Document,
            Timestamp: new Date()
          });
        } else {
          var event = await StudentEvent.create({
            Descriptor: args.input.Descriptor,
            Data: args.input.Data,
            Student: {
              _id: id
            },
            Document: args.input.Document,
            Timestamp: new Date()
          });
        }
        await moduleEventCallbacks[task.Module]({
          task_id: args.Task_id,
          _id: task.ObjectReferenceId,
          event: event,
          pubsub: pubsub
        });
        pubsub.publish(EVENT_ADDED, { eventSub: event });
        return event.save();
      }
    }
  },
  Subscription: {
    taskSub: {
      subscribe: () => pubsub.asyncIterator([TASK_UPDATE]),
    },
    eventSub: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([EVENT_ADDED]),
        (payload, variables, context) => {
          if (context.client && context.client.type === 'student' && payload.eventSub.Descriptor === EVENT_QUESTION_BATCH) {
            if (payload.eventSub.Data._id === context.client._id) {
              return true;
            } else {
              return false;
            }
          }
          return true;
        }
      )
    },
    roomSub: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([ROOM_ADDED, ROOM_UPDATED, ROOM_REMOVED]),
        (payload, variables) => {
          return !variables._id || (payload.roomSub._id.toString() === variables._id);
        }
      )
    }
  }
};

module.exports = {
  typeDefs: [
    typeDefs,
    studentTypeDefs,
    courseTypeDefs,
    roomTypeDefs,
    facultyTypeDefs,
    deviceTypeDefs,
    taskTypeDefs,
    moduleDataTypeDefs,
    moduleTypeDefs
  ],
  resolvers: merge(
    resolvers,
    studentResolvers,
    courseResolvers,
    roomResolvers,
    facultyResolvers,
    deviceResolvers,
    taskResolvers,
    moduleDataResolvers,
    moduleResolvers
  )
};