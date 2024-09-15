const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<dbname>?retryWrites=true&w=majority&tls=true&tlsInsecure=true&tlsAllowInvalidCertificates=true";
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to MongoDB");
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    process.exit(1);
  }
}

connectToDatabase();

app.use(express.json());

app.use(cors({origin: process.env.ALLOWED_ORIGIN || 'https://main--xinstore.netlify.app'}));

app.get('/genshin-accounts/accounts.json', async (req, res) => {
  try {
    const database = client.db("genshin_accounts");
    const accounts = database.collection("accounts");
    const featuredAccounts = await accounts.find({ "featured": true}).toArray();
    console.log("Featured accounts:", featuredAccounts);
    if (featuredAccounts.length === 0) {
      console.log("No featured accounts found");
    }
    res.json(featuredAccounts);
  } catch (e) {
    console.error("Error fetching featured accounts:", e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
