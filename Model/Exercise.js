const { Schema, model } = require("mongoose");

const exerciseSchema = new Schema({
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: String, required: true }
})

const Exercise = model('Exercise', exerciseSchema);

module.exports = Exercise;