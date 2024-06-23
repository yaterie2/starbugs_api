// require something
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

const starSchema2 = new mongoose.Schema({
  id: Number,
  tyc: String,
  gaia: String,
  hd: Number,
  con: String,
  ra: Number,
  dec: Number,
  pos_src: String,
  dist: Number,
  x0: Number,
  y0: Number,
  z0: Number,
  dist_src: String,
  mag: Number,
  absmag: Number,
  ci: Number,
  mag_src: String,
  rv: Number,
  rv_src: String,
  pm_ra: Number,
  pm_dec: Number,
  pm_src: String,
  vx: Number,
  vy: Number,
  vz: Number,
  spect: String,
  spect_src: String,
});

// Create a model based on the schema
const Star2 = mongoose.model("Star", starSchema2);

console.log("connecting to " + mongoUri);
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => console.error("MongoDB connection error:", err));

const corsOptions = {
  origin: [
    "http://localhost:5173",
    frontendUrl,
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://stars.yannick-schwab.de");
//   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });


app.get("/api/allstars", async (req, res) => {
  const minMag = parseFloat(req.query.minMag) || -26.7;
  const maxMag = parseFloat(req.query.maxMag) || 7;

  try {
    const stars = await Star2.find({
      mag: { $gte: minMag, $lte: maxMag },
      x0: { $ne: undefined },
      y0: { $ne: undefined },
      z0: { $ne: undefined },
    });

    res.json({
      stars: stars.map((star) => ({
        x: star.x0,
        y: star.y0,
        z: star.z0,
        id: star.id,
        absmag: star.absmag,
        ci: star.ci,
        mag: star.mag,
        dist: star.dist,
        ra: star.ra,
        dec: star.dec,
        constellation: star.con, // Assuming `con` is the constellation
      })),
    });
  } catch (error) {
    console.error("Error fetching stars:", error);
    res.status(500).json({ error: "Error fetching stars" });
  }
});

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
