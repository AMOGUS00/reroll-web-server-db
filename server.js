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
    await client.db("genshin_accounts").command({ ping: 1 });
    console.log("Connected successfully to MongoDB");
    const database = client.db("genshin_accounts");
    const accounts = database.collection("accounts");
    const count = await accounts.countDocuments();
    console.log(`Total documents in accounts collection: ${count}`);
    const featuredCount = await accounts.countDocuments({ featured: true });
    console.log(`Featured accounts: ${featuredCount}`);
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    console.error("Connection string:", uri.replace(/<password>/, '****'));
    console.error("Node version:", process.version);
    console.error("MongoDB driver version:", require('mongodb/package.json').version);
    process.exit(1);
  }
}

connectToDatabase();

app.use(express.json());

app.use(cors({origin: process.env.ALLOWED_ORIGIN || 'https://main--xinstore.netlify.app'}));

app.get('/genshin-accounts/accounts', async (req, res) => {
  try {
    console.log("Attempting to fetch featured accounts");
    const database = client.db("genshin_accounts");
    const accounts = database.collection("accounts");
    console.log("Connected to database and collection");
    const featuredAccounts = await accounts.find({ featured: true }).toArray();
    console.log("Featured accounts:", JSON.stringify(featuredAccounts, null, 2));
    if (featuredAccounts.length === 0) {
      console.log("No featured accounts found");
    }
    res.json(featuredAccounts);
  } catch (e) {
    console.error("Error fetching featured accounts:", e);
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
