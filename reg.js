const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3002;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/landreg', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define schemas and models
const userSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  password: String,
  email: String,
  address: String
});

const complaintSchema = new mongoose.Schema({
  name: String,
  details: String,
  recordid: String // Changed to String assuming it's an identifier
});

const processSchema = new mongoose.Schema({
  username: String,
  password: String,
  cpassword: String,
  name: String,
  email: String,
  phone: String,
  address: String,
  landdetails: String
});

const taxSchema = new mongoose.Schema({
  propertyvalue: Number,
  taxrate: Number,
  calculatedTax: Number // Added a field to store calculated tax
});

const User = mongoose.model('User', userSchema);
const Complaints = mongoose.model('Complaints', complaintSchema);
const Process = mongoose.model('Process', processSchema);
const Tax = mongoose.model('Tax', taxSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/homemain.html');
});

app.post('/register', (req, res) => {
  const userData = {
    name: req.body.name,
    mobile: req.body.mobile,
    password: req.body.password,
    email: req.body.email,
    address: req.body.address,
  };

  User.create(userData, (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred during registration');
    } else {
      res.redirect('/login');
    }
  });
});

app.post('/login', (req, res) => {
  const { mobile, password } = req.body;

  User.findOne({ mobile, password }, (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred during login.');
    } else if (!user) {
      console.log('User not found in the database');
      res.status(404).send('Login failed. Invalid credentials.');
    } else {
      console.log('Login successful');
      res.redirect('/home.html');
    }
  });
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/home.html', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

app.post('/complaint', (req, res) => {
  const complaintData = {
    name: req.body.name,
    details: req.body.details,
    recordid: req.body.recordid,
  };

  Complaints.create(complaintData, (err, complaint) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while submitting the complaint');
    } else {
      res.redirect('/home.html');
    }
  });
});

app.get('/complaints', (req, res) => {
  Complaints.find({}, (err, complaints) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while fetching complaints');
    } else {
      res.json(complaints);
    }
  });
});

app.post('/process', (req, res) => {
  const processData = {
    username: req.body.username,
    password: req.body.password,
    cpassword: req.body.cpassword,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    landdetails: req.body.landdetails,
  };

  Process.create(processData, (err, process) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while processing');
    } else {
      res.redirect('/home.html');
    }
  });
});

app.get('/processes', (req, res) => {
  Process.find({}, (err, processes) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while fetching processes');
    } else {
      res.json(processes);
    }
  });
});

/// Calculate tax endpoint
app.post('/tax', (req, res) => {
  const { propertyvalue, taxrate } = req.body;

  // Calculate the tax
  const calculatedTax = (propertyvalue * taxrate) / 100;

  // Save the tax calculation to MongoDB
  const taxData = {
    propertyvalue: propertyvalue,
    taxrate: taxrate,
    calculatedTax: calculatedTax
  };

  Tax.create(taxData, (err, tax) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while calculating tax');
    } else {
      // Redirect to home page after saving tax data
      res.redirect('/home.html');
    }
  });
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
