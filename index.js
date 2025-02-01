const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://smart-address-book.netlify.app"
  ],
  credentials: true,
  optionSuccessStatus: 200
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

// ✅ Connect to MongoDB using Mongoose
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wv413.mongodb.net/addressBook?retryWrites=true&w=majority`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// ✅ Create Address Schema & Model
const addressSchema = new mongoose.Schema({
  addressLine1: { type: String, required: true },
  pinCode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: "India" }
});

const Address = mongoose.model("Address", addressSchema);

// ✅ Add Address (POST)
app.post("/add-address", async (req, res) => {
  try {
    const { addressLine1, pinCode, city, state } = req.body;
    if (!addressLine1 || !pinCode) {
      return res.status(400).json({ error: "Address and PIN Code are required" });
    }

    const newAddress = new Address({ addressLine1, pinCode, city, state });
    await newAddress.save();
    
    res.status(201).json({ message: "Address saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving address" });
  }
});

// ✅ Get All Addresses (GET)
app.get("/addresses", async (req, res) => {
  try {
    const { city, state } = req.query;
    let filter = {};
    if (city) filter.city = { $regex: city, $options: "i" };
    if (state) filter.state = { $regex: state, $options: "i" };

    const addresses = await Address.find(filter);
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Error fetching addresses" });
  }
});

// ✅ Fetch City & State Based on PIN Code (GET)
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

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Smart Address Book Server is running");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
