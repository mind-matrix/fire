import { EVENT_SUBMIT_ANSWERS } from '../../constants.js';
import marking from './marking.js';

import { Student, Module } from '../../model';

export default async function ({ task_id, _id, event, pubsub }) {
  if (event.Descriptor === EVENT_SUBMIT_ANSWERS) {
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
    var primaryCategory = Object.keys(scores).reduce((a, b) => obj[a] > obj[b] ? a : b);
    var response = new Module.LSI.LSIResponse({ Student: { _id: event.Student._id }, Responses: answers, Score: scores, Category: primaryCategory });
    var student = await Student.findOne({ _id: event.Student._id });
    student.ModuleData.LSI = {
      Category: primaryCategory
    };
    student.save();
    return response.save();
  }
}