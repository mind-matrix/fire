const { gql } = require('apollo-server-express');
const { Task } = require('../../model');

export const typeDefs = gql`
  type Faculty {
    _id: ID!
    Name: String!
    Username: String!
    DisplayPicture: Document
    Tasks: [Task]
  }
`;

export const resolvers = {
  Faculty: {
    Tasks (parent, args, context, info) {
      return parent.Tasks.map(v => Task.findOne({ _id: v._id }));
    }
  }
};
