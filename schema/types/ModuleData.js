const { gql } = require('apollo-server-express');
const { Module, StudentEvent, FacultyEvent } = require('../../model');

export const typeDefs = gql`
  type LectureInfo {
    StudentEvents: [StudentEvent]
    FacultyEvents: [FacultyEvent]
  }

  type LSIInfo {
    Category: String
  }

  type CrowdTestInfo {
    CrowdTest: CrowdTest!
    Responses: [CrowdResponse]
    Score: Int
    Submissions: Int
  }

  type ModuleData {
    Lecture: [LectureInfo],
    LSI: LSIInfo,
    CrowdTest: [CrowdTestInfo]
  }
`;

export const resolvers = {
  ModuleData: {
    LSI (parent, args, context, info) {
      return parent.LSI;
    }
  },
  LectureInfo: {
    StudentEvents (parent, args, context, info) {
      return parent.StudentEvents.map(v => StudentEvent.findOne({ _id: v._id }));
    },
    FacultyEvents (parent, args, context, info) {
      return parent.FacultyEvents.map(v => FacultyEvent.findOne({ _id: v._id }));
    }
  },
  CrowdTestInfo: {
    CrowdTest (parent, args, context, info) {
      return Module.CrowdTest.CrowdTest.findOne({ _id: parent.CrowdTest._id });
    },
    Responses (parent, args, context, info) {
      return parent.Responses.map(v => Module.CrowdTest.CrowdResponse.findOne({ _id: v._id }));
    }
  },
  LSIInfo: {
    Category (parent, args, context, info) {
      return parent.Category;
    }
  }
};
