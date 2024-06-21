require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.API_PORT || 3000;
const mongoCollection = process.env.MONGO_COLLECTION;
const mongoUri = process.env.MONGO_URI;
const frontendUrl = process.env.FRONTEND_URL;

const starSchema = new mongoose.Schema({
  proper: String,
  con: String,
  bay: String,
  flam: Number,
  mag: Number,
});

const Star = mongoose.model(mongoCollection, starSchema, mongoCollection);

console.log("connecting to " + mongoUri);
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => console.error("MongoDB connection error:", err));

const corsOptions = {
  origin: [frontendUrl, "http://localhost:5173"], // Add the localhost:5174 to the allowed origins
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/constellation", async (req, res) => {
  let { constellation } = req.query;

  console.log(
    `Received constellation query parameter: ${constellation} (type: ${typeof constellation})`
  );

  if (typeof constellation !== "string") {
    constellation = String(constellation);
    console.log(`Converted constellation to string: ${constellation}`);
  }

  console.log(`calling /constellation for: ${constellation}`);
  try {
    const stars = await Star.find({
      con: { $regex: constellation, $options: "i" },
      $or: [
        { bay: { $nin: [null, ""] } },
        { flam: { $nin: [null, ""] } },
        { proper: { $nin: [null, ""] } },
      ],
    }).sort({ mag: 1 });
    res.json(stars);
    console.log(`Found stars: ${stars.length}`);
  } catch (error) {
    console.error("Error fetching star data:", error);
    res.status(500).json({ message: "internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Starbugs API!");
});

app.listen(port, () => {
  console.log(`API script is running on port ${port}.`);
});
