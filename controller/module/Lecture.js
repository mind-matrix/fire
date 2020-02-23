import { ROOM_UPDATED } from '../../constants.js';

const { EVENT_JOIN, EVENT_RESOURCE_UPLOAD, EVENT_EXIT, EVENT_DOUBT, EVENT_EXPLAIN, EVENT_CLEAR, EVENT_CLEAR_REVERT, EVENT_REPEAT, EVENT_UPDATED, STUDENT_JOINED, STUDENT_EXITED } = require('../../constants.js');
const { Student, Room, Task, StudentEvent, FacultyEvent, Module } = require('../../model');

export default async function ({ task_id, _id, event, pubsub }) {
  if(event.Student) {
    if(event.Descriptor === EVENT_JOIN) {
      // Join
      console.log('join');
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
        pubsub.publish(ROOM_UPDATED, { roomSub: room.save() });
        return true;
      } else {
        return false;
      }
    } if(event.Descriptor === EVENT_EXIT) {
      // Exit
      var student = await Student.findOne({ _id: event.Student._id });
      var task = await Task.findOne({ _id: task_id });
      var room = await Room.findOne({ _id: task.Room._id });
      var seat = { Row: student.LastSeatInfo.Row, Column: student.LastSeatInfo.Column };
      if(room.Layout[seat.Row][seat.Column].Occupant && room.Layout[seat.Row][seat.Column].Occupant._id.equals(student._id)) {
        room.Layout[seat.Row][seat.Column].Occupant = null;
      }
      student.Active = false;
      pubsub.publish(STUDENT_EXITED, { studentSub: student.save() });
      pubsub.publish(ROOM_UPDATED, { roomSub: room.save() });
      return true;
    } else if(event.Descriptor === EVENT_DOUBT) {
      // Doubt
      return true;
    } else if(event.Descriptor === EVENT_EXPLAIN) {
      // Explain
      return true;
    } else if(event.Descriptor === EVENT_REPEAT) {
      // Repeat
      return true;
    } else if(event.Descriptor === EVENT_CLEAR) {
      // Clear
      var ref = await StudentEvent.findOne({ _id: event.Data.Reference_id });
      ref.Data.SoftDelete = true;
      pubsub.publish(EVENT_UPDATED, { eventSub: ref.save() });
      return true;
    } else if(event.Descriptor === EVENT_CLEAR_REVERT) {
      // Revert Clear
      var clear = await StudentEvent.findOne({ _id: event.Data.Reference_id, Descriptor: EVENT_CLEAR });
      var ref = await StudentEvent.findOne({ _id: clear.Data.Reference_id });
      clear.Data.SoftDelete = true;
      clear.save();
      ref.Data.SoftDelete = false;
      pubsub.publish(EVENT_UPDATED, { eventSub: ref.save() });
      return true;
    } else {
      return false;
    }
  } else if(event.Faculty) {
    if(event.Descriptor === EVENT_RESOURCE_UPLOAD) {
      return true;
    } else if(event.Descriptor === EVENT_CLEAR_REVERT) {
      var clear = await FacultyEvent.findOne({ _id: event.Data.Reference_id, Descriptor: EVENT_CLEAR });
      var ref = await StudentEvent.findOne({ _id: clear.Data.Reference_id });
      clear.Data.SoftDelete = true;
      clear.save();
      ref.Data.SoftDelete = false;
      pubsub.publish(EVENT_UPDATED, { eventSub: ref.save() });
      return true;
    } else {
      return false;
    }
  }
}