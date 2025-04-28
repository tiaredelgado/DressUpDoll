const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('./public/db');
const { insertItems, cleanUp } = require('./public/seed');
const { Top, Bottom,User ,Shoe} = require("./public/schemas");

app.set('view engine','pug')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
///app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connection.once("open", async () => {
  console.log("Connected to MongoDB.");
  await insertItems();
});

const PORT = 3100;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });



  app.get('/',(req,res)=>{
    res.render('index');
});

  app.post('/storeDoll', (req, res) => {
  const dollName = req.body.dollName;
  const dollImage = req.body.dollImage; // Base64 PNG
  
  console.log('Doll name:', dollName);

  res.send(`Stored your doll "${dollName}" in the dollhouse!`);
});

app.get("/inventory", async (req, res) => {
  try {
    const tops = await Top.find({});
    const bottoms = await Bottom.find({});
    const shoes = await Shoe.find({});
    res.render("inventory", { tops, bottoms,shoes });
  } catch (err) {
    console.error("Error loading inventory:", err);
    res.status(500).send("Something went wrong.");
  }
});



app.get("/login", (req,res) => {
  res.render('login');
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ Email: email });

    if (user && user.Password === password) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Invalid email or password." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.get("/newAccount",async(req,res) =>{
  res.render('newAccount');
});


// /createAccount POST

app.post('/createAccount', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ Email: email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    // Create and save the new user
    const newUser = new User({
      First: firstName,
      Last: lastName,
      Email: email,
      Password: password // 🛑 In production, you should hash the password!
    });

    await newUser.save();
    res.json({ success: true, message: 'Account created successfully!' });

  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});





// Cleanup on termination
process.on("SIGINT", async () => {
  console.log("\nGracefully shutting down... cleaning up data.");
  await cleanUp();
  mongoose.connection.close();
  process.exit(0);
});
