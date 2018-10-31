const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

require("dotenv").config();

var port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/client"));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
  next();
});

const Word = require("./models/word");

// Connect to Mongoose
const mongoURI = process.env.MLABKEY;

mongoose.connect(
  mongoURI,
  { useNewUrlParser: true }
);
var db = mongoose.connection;

//check valid with regex
const isValid = str => {
  return !/[^a-zäöüß,-\s]/i.test(str);
};

app.get("/", (req, res) => {
  res.send("Please use /api/words");
});

//READ All records  or query if there is a query string
app.get("/api/words", (req, res) => {
  if (req.query.sort) {
    // split req str e.g. ?sort=english:desc to {english:'desc'}
    const s = req.query.sort.split(":");
    const q = { [s[0]]: s[1] };
    Word.getWordSorted(q, (err, word) => {
      if (err) {
        throw err;
      }
      res.json(word);
    });
  } else if (req.query.description) {
    Word.getManyWords(req.query, (err, word) => {
      if (err) {
        throw err;
      }
      res.json(word);
    });
  } else if (req.query.english || req.query.german) {
    Word.getSingleWord(req.query, (err, word) => {
      if (err) {
        throw err;
      }
      res.json(word);
    });
  } else {
    Word.getWords((err, words) => {
      if (err) {
        throw err;
      }
      res.json(words);
    });
  }
});

//READ Single Record
app.get("/api/words/:_id", (req, res) => {
  Word.getWordById(req.params._id, (err, word) => {
    if (err) {
      throw err;
    }
    res.json(word);
  });
});

//CREATE
app.post("/api/words", (req, res) => {
  if (!req.body) {
    return console.log("no body");
  }
  const word = req.body;
  if (!word.english || !word.german || !word.description) {
    return console.log("no eng or no german or no description");
  }
  if (
    !isValid(word.english) ||
    !isValid(word.german) ||
    !isValid(word.description)
  ) {
    return console.log("only letters, umlauts and -");
  }
  Word.addWord(word, (err, word) => {
    if (err) {
      throw err;
    }
    res.json(word);
  });
});

//UPDATE - use PUT when sending the whole entity - use PATCH when sending only fields that changed
app.put("/api/words/:_id", (req, res) => {
  if (!req.body) {
    return console.log("no body");
  }
  const word = req.body;
  if (!word.english || !word.german || !word.description) {
    return console.log("no eng or no german or no description");
  }
  Word.updateWord(req.params._id, word, {}, (err, word) => {
    if (err) {
      throw err;
    }
    res.json(word);
  });
});

//DELETE
app.delete("/api/words/:_id", (req, res) => {
  if (!req.params._id) {
    return console.log("no id");
  }
  const id = req.params._id;
  Word.removeWord(id, (err, word) => {
    if (err) {
      throw err;
    }
    res.json(word);
  });
});

app.listen(port, () => console.log(`app running on port ${port}`));
