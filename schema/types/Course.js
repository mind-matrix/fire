const { gql } = require('apollo-server-express');
const { Faculty, Student } = require('../../model');

export const typeDefs = gql`
  type Course {
    _id: ID!
    Title: String!
    Code: String!
    Faculty: Faculty!
    RegisteredStudents: [Student]
  }

  input AddCourseInput {
    Title: String!
    Code: String!
  }

  input UpdateCourseInput {
    Title: String
    Code: String
  }
`;

export const resolvers = {
  Course: {
    Faculty (parent, args, context, info) {
      return Faculty.findOne({ _id: parent.Faculty._id });
    },
    RegisteredStudents (parent, args, context, info) {
      return parent.RegisteredStudents.map(v => Student.findOne({ _id: v._id }));
    }
  }
};