import { ROOM_UPDATED } from '../../constants.js';
import Distributor from '../../lib/Distributor'

const { EVENT_ADDED, EVENT_JOIN, EVENT_EXIT, EVENT_END_TEST, EVENT_SUBMIT_QUESTION, EVENT_QUESTION_BATCH, EVENT_TEST_RESULT, EVENT_SUBMIT_ANSWER, EVENT_EDIT_QUESTION, EVENT_DISPATCH_QUESTIONS, STUDENT_JOINED, STUDENT_EXITED } = require('../../constants.js');
const { Student, Room, Task, StudentEvent, FacultyEvent, Module } = require('../../model');

export default async function ({ task_id, _id, event, pubsub }) {
  if(event.Student) {
    if(event.Descriptor === EVENT_JOIN) {
      // Join
      var student = await Student.findOne({ _id: event.Student._id });
      var task = await Task.findOne({ _id: task_id });
      var room = await Room.findOne({ _id: task.Room._id });
      var seat = room.Layout[event.Data.Row][event.Data.Column];
      if(seat.Seat && (!seat.Occupant || !seat.Occupant._id)) {
        student.Active = true;
        var info = {
          Room: { _id: room._id },
          Row: event.Data.Row,
          Column: event.Data.Column
        };
        student.LastSeatInfo = info;
        student.SeatingHistory.addToSet(info);
        room.Layout[event.Data.Row][event.Data.Column].Occupant = { _id: student._id }; 
        room.Layout = JSON.parse(JSON.stringify(room.Layout));
        await Module.CrowdTest.CrowdTest.updateOne({ _id: _id }, { $addToSet: { Students: { _id: student._id } } });
        pubsub.publish(STUDENT_JOINED, { studentSub: student.save() });
        pubsub.publish(ROOM_UPDATED, { roomSub: await room.save() });
        return true;
      } else {
        return false;
      }
    } else if(event.Descriptor === EVENT_EXIT) {
      // Exit
      var student = await Student.findOne({ _id: event.Student._id });
      var task = await Task.findOne({ _id: task_id });
      var room = await Room.findOne({ _id: task.Room._id });
      var seat = { Row: student.LastSeatInfo.Row, Column: student.LastSeatInfo.Column };
      if(room.Layout[seat.Row][seat.Column].Occupant && room.Layout[seat.Row][seat.Column].Occupant._id.equals(student._id)) {
        room.Layout[seat.Row][seat.Column].Occupant = null;
      }
      room.Layout = JSON.parse(JSON.stringify(room.Layout));
      student.Active = false;
      pubsub.publish(STUDENT_EXITED, { studentSub: student.save() });
      pubsub.publish(ROOM_UPDATED, { roomSub: await room.save() });
      return true;
    } else if(event.Descriptor === EVENT_SUBMIT_QUESTION) {
      let question = new Module.CrowdTest.CrowdQuestion({
        Text: event.Data.Text,
        Author: {
          _id: event.Student._id
        },
        Options: event.Data.Options,
        Correct: event.Data.Correct,
        Difficulty: 0,
        Tags: []
      });
      await Module.CrowdTest.CrowdTest.updateOne({ _id: _id }, { $addToSet: { Questions: { _id: question._id } } });
      await question.save();
      return true;
    } else if(event.Descriptor === EVENT_SUBMIT_ANSWER) {
      let question = await Module.CrowdTest.CrowdQuestion.findOne({
        _id: event.Data._id
      });
      let response = new Module.CrowdTest.CrowdResponse({
        Author: {
          _id: event.Student._id
        },
        Question: {
          _id: question._id
        },
        Selection: event.Data.Selection,
        Score: (event.Data.Selection === question.Correct) ? 1 : 0
      });
      await Module.CrowdTest.CrowdTest.updateOne({ _id: _id }, { $addToSet: { Responses: { _id: response._id } } });
      await response.save();
      return true;
    }
  } else {
    if(event.Descriptor === EVENT_EDIT_QUESTION) {
      
    } else if(event.Descriptor === EVENT_DISPATCH_QUESTIONS) {
      let test = await Module.CrowdTest.CrowdTest.findOne({ _id });
      let students = [];
      for(let st of test.Students) {
        students.push(await Student.findOne({ _id: st._id }));
      }
      let questions = [];
      for(let q of test.Questions) {
        questions.push(await Module.CrowdTest.CrowdQuestion.findOne({ _id: q._id }));
      }
      let distributions = await Distributor(students, questions);
      for(let batch of distributions) {
        let e = new FacultyEvent({
          Descriptor: EVENT_QUESTION_BATCH,
          Data: {
            _id: batch.student._id,
            Questions: batch.questions
          },
          Faculty: {
            _id: event.Faculty._id
          }
        });
        pubsub.publish(EVENT_ADDED, { eventSub: e });
      }
      return true;
    } else if(event.Descriptor === EVENT_END_TEST) {
      let test = await Module.CrowdTest.CrowdTest.findOne({ _id });
      let responses = [];
      for(let response of test.Responses) {
        responses.push(await Module.CrowdTest.CrowdResponse.findOne({ _id: response._id }));
      }
      for(let student of test.Students) {
        let filteredResponses = responses.filter(v => {
          console.log(v.Author._id, student._id);
          return v.Author._id.toString() === student._id.toString();
        });
        let score = filteredResponses.map(v => v.Score).reduce((a,v) => a + v);
        let e = new FacultyEvent({
          Descriptor: EVENT_TEST_RESULT,
          Data: {
            _id: student._id,
            Score: score
          },
          Faculty: {
            _id: event.Faculty._id
          }
        });
        pubsub.publish(EVENT_ADDED, { eventSub: e });
      }
      return true;
    }
  }
  return true;
};