import TextSim from './TextSim.class';

export default async function (students, questions) {
  let textsim = new TextSim();
  await textsim.init();
  let sets = [];
  for (student of students) {
    let qbank = questions.filter(v => v.Author._id !== student._id);
    let similarities = await this.textsim.compare(qbank.map((v) => v.Text));
    let groups = await this.textsim.groupSimilar({
        sets: qbank,
        threshold: 0.6,
        similarities: similarities
    });
    sets.push({ student, questions: groups.map(v => v[Math.floor(Math.random() * v.length)]) });
  }
  return sets;
}