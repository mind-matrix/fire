const { gql } = require('apollo-server-express');
require('graphql-iso-date');

const { Student, Course, Room, Faculty, Module, StudentEvent, FacultyEvent } = require('../../model');

import LectureEventHandler from '../../controller/module/Lecture'

export const typeDefs = gql`
  type Document {
    filename: String
    mimetype: String
    encoding: String
    id: String
  }

  type StudentEvent {
    _id: ID!
    Descriptor: String!
    Data: JSON
    Student: Student
    Document: Document
    Timestamp: DateTime
  }

  type FacultyEvent {
    _id: ID!
    Descriptor: String!
    Data: JSON
    Faculty: Faculty
    Document: Document
    Timestamp: DateTime
  }

  union Event = StudentEvent | FacultyEvent

  input AddEventInput {
    Type: String
    Student_id: ID
    Descriptor: String!
    Data: JSON
    Document: Upload
  }

  type CrowdQuestion {
    _id: ID!
    Text: String
    Author: Student
    Options: [String!]!
    Correct: Int
    Difficulty: Int
    Tags: [String!]!
  }
  
  type CrowdResponse {
    _id: ID!
    Author: Student!
    Question: CrowdQuestion!
    Selection: Int
    Score: Int
  }

  enum LSICategory {
    ACTIVIST
    THEORIST
    PRAGMATIST
    REFLECTOR
  }

  type LSIResponse {
    Student: Student!
    Responses: [Int!]!
    Category: LSICategory
  }

  type Lecture {
    _id: ID!
    Course: Course!
    Faculty: Faculty!
    Start: DateTime
    End: DateTime
    Students: [Student]
    StudentEvents: [StudentEvent]
    FacultyEvents: [FacultyEvent]
  }

  type CrowdTest {
    _id: ID!
    Faculty: Faculty!
    Questions: [CrowdQuestion]
    Start: DateTime
    End: DateTime
    Dispatch: DateTime
    Responses: [CrowdResponse]
    StudentEvents: [StudentEvent]
    FacultyEvents: [FacultyEvent]
  }

  type LSI {
    _id: ID!
    Faculty: Faculty!
    Responses: [LSIResponse]
  }

  union Module = Lecture | CrowdTest | LSI
`;

export const resolvers = {
  Event: {
    __resolveType (parent, args, context, info) {
      if (parent.Student) {
        return 'StudentEvent';
      } else {
        return 'FacultyEvent';
      }
    }
  },
  StudentEvent: {
    Student (parent, args, context, info) {
      return Student.findOne({ _id: parent.Student._id });
    }
  },
  FacultyEvent: {
    Faculty (parent, args, context, info) {
      return Faculty.findOne({ _id: parent.Faculty._id });
    }
  },
  CrowdQuestion: {
    Author (parent, args, context, info) {
      return Student.findOne({ _id: parent.Author._id });
    }
  },
  CrowdResponse: {
    Author (parent, args, context, info) {
      return Student.findOne({ _id: parent.Author._id });
    },
    Question (parent, args, context, info) {
      return Module.CrowdTest.CrowdQuestion.findOne({ _id: parent.Question._id });
    }
  },
  LSIResponse: {
    Student (parent, args, context, info) {
      return Student.findOne({ _id: parent.Student._id });
    }
  },
  Lecture: {
    __isTypeOf (parent, context, info) {
      return 'Lecture';
    },
    Course (parent, args, context, info) {
      return Course.findOne({ _id: parent.Course._id });
    },
    Faculty (parent, args, context, info) {
      return Faculty.findOne({ _id: parent.Faculty._id });
    },
    Students (parent, args, context, info) {
      return parent.Students.map(v => Student.findOne({ _id: v._id }));
    },
    StudentEvents (parent, args, context, info) {
      return parent.StudentEvents.map(v => StudentEvent.findOne({ _id: v._id }));
    },
    FacultyEvents (parent, args, context, info) {
      return parent.FacultyEvents.map(v => FacultyEvent.findOne({ _id: v._id }));
    }
  },
  CrowdTest: {
    __isTypeOf (parent, context, info) {
      return 'CrowdTest';
    },
    Faculty (parent, args, context, info) {
      return Faculty.findOne({ _id: parent.Faculty._id });
    },
    Questions (parent, args, context, info) {
      return parent.Questions.map(v => Module.CrowdTest.CrowdQuestion.findOne({ _id: v._id }));
    },
    Responses (parent, args, context, info) {
      return parent.Responses.map(v => Module.CrowdTest.CrowdResponse.findOne({ _id: v._id }));
    }
  },
  LSI: {
    __isTypeOf (parent, context, info) {
      return 'LSI';
    },
    Faculty (parent, args, context, info) {
      return Faculty.findOne({ _id: parent.Faculty._id });
    },
    Responses (parent, args, context, info) {
      return parent.Responses.map(v => Module.LSI.LSIResponse.findOne({ _id: v._id }));
    }
  }
};

export const eventCallbacks = {
  async Lecture({task_id, _id, event, pubsub}) {
    var lecture = await Module.Lecture.Lecture.findOne({ _id: _id });
    if(await LectureEventHandler({ task_id, _id, event, pubsub })) {
      if(event.Faculty) {
        // Faculty Event
        lecture.FacultyEvents.push({ _id: event._id });
      } else {
        // Student Event
        lecture.StudentEvents.push({ _id: event._id });
      }
      lecture.save();
      return true;
    } else {
      return false;
    }
  },
  async CrowdTest(_id, event) {
  
  },
  async LSI(_id, event) {
  }
};
