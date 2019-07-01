const mongoose = require("mongoose");

// Book Schema
const vocabSchema = mongoose.Schema({
  english: {
    type: String,
    required: true
  },
  german: {
    type: [String],
    required: true
  },
  description: {
    type: String
  },

  create_date: {
    type: Date,
    default: Date.now
  }
});

const Word = (module.exports = mongoose.model("Word", vocabSchema));

// Get All Words limit not used
module.exports.getWords = (callback, limit) => {
  Word.find(callback).limit(limit);
};

// Get All matching words for description
module.exports.getManyWords = (query, callback, limit) => {
  Word.find(query, callback).limit(limit);
};

// read sorted
module.exports.getWordSorted = (q, callback, limit) => {
  Word.find({}, null, { sort: q }, callback).limit(limit);
};

// query one word
module.exports.getSingleWord = (query, callback) => {
  Word.findOne(query, callback);
};

// Get Single Word
module.exports.getWordById = (id, callback) => {
  Word.findById(id, callback);
};

// Add Word
module.exports.addWord = (word, callback) => {
  Word.create(word, callback);
};

// Update Word
module.exports.updateWord = (theId, word, options, callback) => {
  var query = { _id: theId };

  var update = {
    english: word.english,
    german: word.german,
    description: word.description
  };
  Word.findOneAndUpdate(query, update, options, callback);
};

// Delete Word
module.exports.removeWord = (id, callback) => {
  var query = { _id: id };
  Word.remove(query, callback);
};
