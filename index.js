const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wv413.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
  console.log("Smart Book is connected to MongoDB");
}).catch(err => console.error("MongoDB connection error:", err));







app.get('/', (req, res) => {
    res.send('Smart Address Book Server is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
