const fs = require("fs");
const path = require("path");
const mongoose = require("./db");
const { Top, Bottom,Shoe } = require("./schemas");

async function insertItems() {
  // TOPS
  const topFolder = path.join(__dirname, "images/tops");

  const topFiles = fs.readdirSync(topFolder).filter(file => file.endsWith(".png"));

  const topItems = topFiles.map((file, index) => ({
    ID: index + 1,
    Name: path.parse(file).name,
    Order: index + 1,
    ImagePath: `images/tops/${file}`
  }));

  await Top.insertMany(topItems);
  console.log("Inserted top items:", topItems.length);

  // BOTTOMS
  const bottomFolder = path.join(__dirname, "images/bottoms");
  const bottomFiles = fs.readdirSync(bottomFolder).filter(file => file.endsWith(".png"));

  const bottomItems = bottomFiles.map((file, index) => ({
    ID: index + 1,
    Name: path.parse(file).name,
    Order: index + 1,
    ImagePath: `images/bottoms/${file}`
  }));

  await Bottom.insertMany(bottomItems);
  console.log("Inserted bottom items:", bottomItems.length);


// SHOES
const shoeFolder = path.join(__dirname, "images/shoes");
const shoeFiles = fs.readdirSync(shoeFolder).filter(file => file.endsWith(".png"));

const shoeItems = shoeFiles.map((file, index) => ({
  ID: index + 1,
  Name: path.parse(file).name,
  Order: index + 1,
  ImagePath: `images/shoes/${file}`
}));

await Shoe.insertMany(shoeItems);
console.log("Inserted shoe items:", shoeItems.length);



}

// Cleanup collections on termination
async function cleanUp() {
  try {
    await Top.deleteMany({});
    await Bottom.deleteMany({});
    await Shoe.deleteMany({});
    console.log("Collections deleted.");
  } catch (err) {
    console.error("Error during cleanup:", err);
  } finally {
    mongoose.connection.close();
  }
}



module.exports = { insertItems, cleanUp };
