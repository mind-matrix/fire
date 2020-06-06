const Mongoose = require('mongoose');

const FeedbackSchema = new Mongoose.Schema({
    Account: {
        type: {
            Type: {
                type: String,
            },
            _id: {
                type: Mongoose.Schema.Types.ObjectId
            }
        },
        unique: true
    },
    Ratings: [Number]
}, { timestamps: { createdAt: true } });

FeedbackSchema.virtual('Score').get(function() {
    let ratings = this.Ratings.map((score, i) => {
        if (i % 2 == 0)
            return score - 1
        else
            return 5 - score
    });
    return ratings.reduce((a, v) => a + v, 0) * 2.5;
});

module.exports = Mongoose.model("Feedback", FeedbackSchema);