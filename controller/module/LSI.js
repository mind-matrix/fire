import { EVENT_JOIN, EVENT_EXIT, EVENT_SUBMIT_ANSWERS } from '../../constants.js';
import marking from './marking.js';

import { Student, Module } from '../../model';

export default async function ({ task_id, _id, event, pubsub }) {
  if(event.Student) {
    if(event.Descriptor === EVENT_JOIN) {
      // Join
      var student = await Student.findOne({ _id: event.Student._id });
      var task = await Task.findOne({ _id: task_id });
      var lecture = await Module.Lecture.Lecture.findOne({ _id: _id });
      var room = await Room.findOne({ _id: task.Room._id });
      var seat = room.Layout[event.Data.Row][event.Data.Column];
      if(seat.Seat && (!seat.Occupant || !seat.Occupant._id)) {
        student.Active = true;
        var info = {
          Room: { _id: room._id },
          Row: event.Data.Row,
          Column: event.Data.Column,
          Course: { _id: lecture.Course._id }
        };
        student.LastSeatInfo = info;
        student.SeatingHistory.addToSet(info);
        room.Layout[event.Data.Row][event.Data.Column].Occupant = { _id: student._id }; 
        room.Layout = JSON.parse(JSON.stringify(room.Layout));
        lecture.Students.addToSet({ _id: student._id });
        await lecture.save();
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
    } else if (event.Descriptor === EVENT_SUBMIT_ANSWERS) {
      var answers = event.Data;
      var scores = {
        activist: 0,
        reflector: 0,
        theorist: 0,
        pragmatist: 0
      };
      answers.forEach((v, i) => {
        var qidx = i+1;
        if(v === 1) {
          for(let [type, questions] of Object.entries(marking)) {
            if(questions.includes(qidx)) {
              scores[type] += 1;
            }
          }
        }
      });
      var primaryCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
      var response = new Module.LSI.LSIResponse({ Student: { _id: event.Student._id }, Responses: answers, Score: scores, Category: primaryCategory });
      var student = await Student.findOne({ _id: event.Student._id });
      if(!student.ModuleData) {
        student.ModuleData = {
          LSI: {
            Category: primaryCategory
          }
        };
      } else {
        student.ModuleData.LSI = {
          Category: primaryCategory
        };
      }
      student.save();
      return response.save();
    }
  }
}