const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/DollHouse");
module.exports = mongoose;
