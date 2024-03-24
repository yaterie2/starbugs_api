require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

const port = 3000;

/* const username = process.env.MONGO_INITDB_ROOT_USERNAME;
const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
 */
const mongoUri = process.env.MONGO_URI + process.env.MONGO_DB;
const mongoCollection = process.env.MONGO_COLLECTION;

const starSchema = new mongoose.Schema({
    proper: String,
    con: String,
    bay: String,
    flam: Number,
    mag: Number,
});

const Star = mongoose.model(mongoCollection, starSchema, mongoCollection);

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connection successful'))
    .catch(err => console.error('MongoDB connection error:', err));

const corsOptions = {
    origin: process.env.FRONTEND_URL,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/constellation', async (req, res) => {
    const { constellation } = req.query;
    console.log(`calling /api/constellation for: ${constellation}`);
    try {
        const stars = await Star.find({
            con: { $regex: constellation, $options: 'i' },
            $or: [
                { bay: { $nin: [null, ''] } },
                { flam: { $nin: [null, ''] } },
                { proper: { $nin: [null, ''] } }
            ]
        }).sort({ mag: 1 });
        res.json(stars);
        // console.log(`Found stars: ${stars.length}`);
    } catch (error) {
        console.error('Fehler beim Abrufen der Sterndaten:', error);
        res.status(500).json({ message: 'Interner Serverfehler' });
    }
});

app.get('/', (req, res) => {
    // console.log("calling root endpoint");
    res.send('Welcome to the Starbugs API');
});

app.listen(port, () => {
    console.log(`API script is running.`);
});
