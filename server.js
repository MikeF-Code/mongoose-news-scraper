var express = require("express");
var mongoose = require("mongoose");
var PORT = process.env.PORT || 8080;
var app = express();
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

app.get("/scrape", function(req, res) {
  axios.get("http://old.reddit.com/r/Games").then(function(response) {
  var newArticleCount = 0;
  var $ = cheerio.load(response.data);
  $("p.title").each(function(i, element) {
      var result = {};
      result.title = $(this).text();
      result.link = $(this).children().attr("href");
      db.Article.findOne({link: result.link})
      .then(function(dbArticleFound) {
        if (!dbArticleFound) {
          db.Article.create(result)
          .then(function(dbArticle) {
              console.log(dbArticle);
              newArticleCount++;
          })
          .catch(function(err) {
              console.log(err);
          });  
        } else {
          console.log("Article already exists.  Moving onto next.");
        }
      });
  });
  res.send("Scrape Complete");
  });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
  .then(function(dbArticle) {
      res.json(dbArticle);
  })
  .catch(function(err) {
      res.json(err);
  });
});

app.get("/comments/:id", function(req, res) {
  db.Comment.find({ articleID: req.params.id })
  .then(function(dbArticle) {
      res.json(dbArticle);
  })
  .catch(function(err) {
      res.json(err);
  });
});

app.post("/comments/:id", function(req, res) {
  db.Comment.create(req.body)
  .then(function(dbComment) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
  })
  .then(function(dbArticle) {
      res.json(dbArticle);
  })
  .catch(function(err) {
      res.json(err);
  });
});

app.get("/comments/delete/:id", function(req, res) {
db.Comment.findOneAndDelete({ _id: req.params.id })
  .then(function() {
    console.log("Delete operation on comment should be complete...");
  }, function(){
    console.log("Delete operation failed.");
  })
  .catch(function(err) {
    res.json(err);
  });
});

