const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://smart-address-book.netlify.app'
],
  credentials: true,
  optionSuccessStatus: 200,
}


const app = express();
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wv413.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

client.connect().then(() => {
  db = client.db("addressBook");
  console.log("Connected to MongoDB");
}).catch(err => console.error("MongoDB connection error:", err));

// Add address
app.post("/add-address", async (req, res) => {
  try {
    const { addressLine1, pinCode, city, state } = req.body;
    if (!addressLine1 || !pinCode) {
      return res.status(400).json({ error: "Address and PIN Code are required" });
    }
    const result = await db.collection("addresses").insertOne({ addressLine1, pinCode, city, state, country: "India" });
    res.status(201).json({ message: "Address saved successfully", id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Error saving address" });
  }
});

// Get all addresses with optional filtering by city or state
app.get("/addresses", async (req, res) => {
  try {
    const { city, state } = req.query;
    let filter = {};
    if (city) filter.city = { $regex: city, $options: "i" };
    if (state) filter.state = { $regex: state, $options: "i" };
    
    const addresses = await db.collection("addresses").find(filter).toArray();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Error fetching addresses" });
  }
});

// Fetch city and state based on PIN Code using a working API
app.get("/get-address/:pinCode", async (req, res) => {
  try {
    const { pinCode } = req.params;
    if (!/^[0-9]{6}$/.test(pinCode)) {
      return res.status(400).json({ error: "Invalid PIN Code format" });
    }
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pinCode}`);
    const details = response.data[0];
    if (details.Status === "Success") {
      const { District, State } = details.PostOffice[0];
      res.json({ city: District, state: State });
    } else {
      res.status(400).json({ error: "Invalid PIN Code" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching address details" });
  }
});

app.get('/', (req, res) => {
    res.send('Smart Address Book Server is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});