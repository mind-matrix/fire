const { gql } = require('apollo-server-express');

const { Device, Course, Room } = require('../../model');

export const typeDefs = gql`
  type SeatHistory {
    Room: Room
    Row: Int
    Column: Int
  }

  type Student {
    _id: ID!
    Name: String
    Identifier: String!
    Email: String
    Device: Device!
    Active: Boolean
    SeatingHistory: [SeatHistory]
    DisplayPicture: Document
    RegisteredCourses: [Course]
    ModuleData: ModuleData
  }

  input RegisterStudentsInput {
    Student_ids: [ID!]!
    Course_id: ID!
  }
`;

export const resolvers = {
  SeatHistory: {
    Room (parent, args, context, info) {
      return Room.findOne({ _id: parent.Room._id });
    }
  },
  Student: {
    Device (parent, args, context, info) {
      return Device.findOne({ _id: parent.Device._id });
    },
    RegisteredCourses (parent, args, context, info) {
      return parent.map(v => Course.findOne({ _id: v._id }));
    },
    SeatingHistory (parent, args, context, info) {
      return parent.SeatingHistory;
    },
    ModuleData (parent, args, context, info) {
      return parent.ModuleData;
    }
  }
};
