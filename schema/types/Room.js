const { gql } = require('apollo-server-express');
const { Student, Faculty, Task } = require('../../model');

export const typeDefs = gql`
  type Usage {
    Faculty: Faculty
    Task: Task
  }

  type Cell {
    Seat: Boolean
    Occupant: Student
  }

  input CellInput {
    Seat: Boolean
  }

  type Room {
    _id: ID!
    Name: String
    Capacity: Int
    Layout: [[Cell!]!]!
    Available: Boolean
    Usage: Usage
  }

  input AddRoomInput {
    Name: String
    Layout: [[CellInput!]!]!
  }

  input UpdateRoomInput {
    Layout: [[CellInput!]!]!
    Available: Boolean
  }
`;

export const resolvers = {
  Usage: {
    Faculty (parent, args, context, info) {
      return Faculty.findOne({ _id: parent.Faculty._id });
    },
    Task (parent, args, context, info) {
      return Task.findOne({ _id: parent.Task._id });
    },
  },
  Cell: {
    Occupant (parent, args, context, info) {
      return Student.findOne({ _id: parent.Occupant._id });
    }
  }
};