const mongoose = require("./db");

// Top schema
const topSchema = new mongoose.Schema({
  ID: Number,
  Name: String,
  Order: Number,
  ImagePath: String
});
const Top = mongoose.model("Top", topSchema);

// Bottom schema
const bottomSchema = new mongoose.Schema({
  ID: Number,
  Name: String,
  Order: Number,
  ImagePath: String
});
const Bottom = mongoose.model("Bottom", bottomSchema);

// Shoe schema
const shoeSchema = new mongoose.Schema({
  ID: Number,
  Name: String,
  Order: Number,
  ImagePath: String
});
const Shoe = mongoose.model("Shoe", shoeSchema);

// Outfit schema
const outfitSchema = new mongoose.Schema({
  ID: Number,
  Owner:Number,
  Top: Number,
  Bottom: Number,
  Shoe: Number,
  Name: String
});
const Outfit = mongoose.model("Outfit", outfitSchema);

//user/owner schema
const userSchema = new mongoose.Schema({
  ID: Number,
  First: String,
  Last: String,
  Email: String,
  Password: String

});

const User = mongoose.model("User", userSchema);


module.exports = { Top, Bottom, Shoe, Outfit,User };
