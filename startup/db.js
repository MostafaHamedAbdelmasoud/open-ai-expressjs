const mongoose = require('mongoose');
const dotenv = require('dotenv');

module.exports = function() {
  const db = process.env.DB_URL;
  mongoose.connect(db)
    .then(() => console.log(`Connected to ${db}...`));
}