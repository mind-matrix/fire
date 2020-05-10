import { ROOM_UPDATED } from '../../constants.js';

const { EVENT_JOIN, EVENT_EXIT, EVENT_SUBMIT_QUESTION, EVENT_SUBMIT_ANSWER, EVENT_EDIT_QUESTION, EVENT_DISPATCH_QUESTIONS, STUDENT_JOINED, STUDENT_EXITED } = require('../../constants.js');
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
        await Module.Lecture.Lecture.updateOne({ _id: _id }, { $addToSet: { Students: { _id: student._id } } });
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
      
    } else if(event.Descriptor === EVENT_SUBMIT_ANSWER) {

    }
  } else {
    if(event.Descriptor === EVENT_EDIT_QUESTION) {
      
    } else if(event.Descriptor === EVENT_DISPATCH_QUESTIONS) {

    } else if(event.Descriptor === EVENT_END_TEST) {

    }
  }
  return true;
};