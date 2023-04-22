const mongoose = require('mongoose');
const dotenv = require('dotenv');


module.exports = function() {

const userName = "root";
const password = "example";
const databasePort = "27017";
const dbHost = "mongo";

const db = `mongodb://${userName}:${password}@${dbHost}:${databasePort}`;
mongoose
  .connect(db)
  .then(() => console.log("mongo is connected sucessfully..."))
  .catch((err) => console.log("error in connecting to mongo", err));


  // const db = process.env.DB_URL;
  // mongoose.connect(db)
  //   .then(() => console.log(`Connected to ${db}...`));
}