const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());







app.get('/', (req, res) => {
    res.send('Smart Address Book Server is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
