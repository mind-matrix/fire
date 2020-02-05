const { gql } = require('apollo-server-express');
const { Student } = require('../../model');

export const typeDefs = gql`
  type SIMData {
    Number: String!
    Carrier: String
  }
  type Device {
    _id: ID!
    DeviceModel: String!
    Student: Student!
    SIM: SIMData!
  }
`;

export const resolvers = {
  Device: {
    Student (parent, args, context, info) {
      return Student.findOne({ _id: parent.Student._id });
    }
  }
};
