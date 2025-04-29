const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const mongoose = require('./public/db');
const { insertItems, cleanUp } = require('./public/seed');
const { Top, Bottom,User ,Shoe, Outfit} = require("./public/schemas");
const bcrypt = require('bcrypt'); // For hashing passwords

app.set('view engine','pug')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
///app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: 'yourSecretKey', // 🔒 Change this to a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // secure: true only if using HTTPS
}));


mongoose.connection.once("open", async () => {
  console.log("Connected to MongoDB.");
  await insertItems();
});

const PORT = 3100;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });

  let dollhouse = [];


  app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
  });
  

/*app.post('/storeDoll', (req, res) => {
  const { dollName, dollImage } = req.body;

  dollhouse.push({
    name: dollName,
    image: dollImage
  });

  res.json({ success: true }); 
});*/

app.post('/storeDoll', (req, res) => {
  const { dollName, dollImage } = req.body;

  dollhouse.push({
    dollName: dollName,
    dollImage: dollImage
  });

  res.json({ success: true }); 
});




app.get('/dollhouse', async (req, res) => {
  try {
    if (req.session.user) {
      // Save local dolls to the database if there are any
      if (dollhouse.length > 0) {
        const dollsToSave = dollhouse.map(doll => ({
          Owner: req.session.user.id,
          dollName: doll.dollName,
          dollImage: doll.dollImage
        }));

        await Outfit.insertMany(dollsToSave);
        console.log(`Saved ${dollsToSave.length} dolls to the database.`);
        
        // Clear the local dollhouse after saving
        dollhouse = [];
      }

      // Fetch dolls from the database for the current user
      const userDolls = await Outfit.find({ Owner: req.session.user.id });
      return res.json(userDolls);
    } else {
      // If not logged in, return locally stored dolls
      return res.json(dollhouse);
    }
  } catch (error) {
    console.error("Error loading dollhouse:", error);
    res.status(500).json({ success: false, message: 'Error loading dollhouse.' });
  }
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
      req.session.user = {
        id: user._id,
        email: user.Email,
        firstName: user.First,
        lastName: user.Last
      };

      // 👇 If there are any dolls locally stored, save them to the database
      if (dollhouse.length > 0) {
        const dollsToSave = dollhouse.map(doll => ({
          Owner: user._id,
          dollName: doll.dollNamename,  // local dollhouse uses 'name'
          dollImage: doll.dollImage
        }));

        await Outfit.insertMany(dollsToSave);

        // After saving, clear the local dollhouse
        dollhouse = [];
      }

      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.use((req, res, next) => {
  res.locals.user = req.session.user;  // Makes user available in all views
  next();
});


/*
app.get('/logout', async (req, res) => {
  try {
    if (req.session.user && dollhouse.length > 0) {
      // If there are dolls locally and the user is logged in, save them to the database
      const dollsToSave = dollhouse.map(doll => ({
        Owner: req.session.user.id,
        dollName: doll.name,
        dollImage: doll.image
      }));

      await Outfit.insertMany(dollsToSave);

      console.log(`Saved ${dollsToSave.length} dolls to database before logout.`);
    }

    // Clear dollhouse
    dollhouse = [];

    // Destroy the session
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ success: false, message: "Logout failed." });
      }
      // Redirect to the homepage after logging out
      res.redirect('/');
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ success: false, message: "Internal server error during logout." });
  }
});*/

app.get('/logout', async (req, res) => {
  try {
    // Clear the session
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ success: false, message: "Logout failed." });
      }
      // Redirect to the homepage after logging out
      res.redirect('/');
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ success: false, message: "Internal server error during logout." });
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

    //session for user
    req.session.user = {
      id: newUser._id,
      email: newUser.Email,
      firstName: newUser.First,
      lastName: newUser.Last
    };
    res.json({ success: true, message: 'Account created successfully!' });

    // 👇 If there are any dolls locally stored, save them to the database
    if (dollhouse.length > 0) {
      const dollsToSave = dollhouse.map(doll => ({
        Owner: newUser._id,
        dollName: doll.dollName,  // local dollhouse uses 'name'
        dollImage: doll.dollImage
      }));

      await Outfit.insertMany(dollsToSave);

      // After saving, clear the local dollhouse
      dollhouse = [];
    }

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
