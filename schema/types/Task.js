const { gql } = require('apollo-server-express');
const { Module, Room } = require('../../model');

export const typeDefs = gql`
  enum TaskState {
    RUNNING
    PAUSED
    FINISHED
  }

  type Task {
    _id: ID!
    Module: String!
    Start: DateTime!
    Faculty: Faculty!
    End: DateTime
    State: TaskState
    Room: Room!
    Object: Module
  }

  input TaskInput {
    Module: String!
    Room_id: ID
    Course_id: ID
  }
`;

export const resolvers = {
  Task: {
    Faculty (parent, args, context, info) {
      return Faculty.findOne({ _id: parent.Faculty._id });
    },
    Room (parent, args, context, info) {
      return Room.findOne({ _id: parent.Room._id });
    },
    Object (parent, args, context, info) {
      return Module[parent.Module][parent.Module].findOne({ _id: parent.ObjectReferenceId });
    }
  }
};
