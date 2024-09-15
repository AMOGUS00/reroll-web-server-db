const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error(e);
  }
}

connectToDatabase();

app.use(express.json());

app.use(cors({origin: process.env.ALLOWED_ORIGIN || 'https://main--xinstore.netlify.app'}));

app.get('/api/featured-accounts', async (req, res) => {
  try {
    const database = client.db("genshin_accounts");
    const accounts = database.collection("accounts");
    const featuredAccounts = await accounts.find({ featured: true }).toArray();
    res.json(featuredAccounts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
