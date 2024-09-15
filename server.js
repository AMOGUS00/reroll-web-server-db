const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Use a single connection string
const uri = process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    process.exit(1);
  }
}

connectToDatabase();

app.use(express.json());
app.use(cors({origin: process.env.ALLOWED_ORIGIN || 'https://main--xinstore.netlify.app'}));

app.get('/genshin-accounts/accounts', async (req, res) => {
  try {
    const server = req.query.server;
    let dbName;

    switch (server) {
      case 'EU':
        dbName = "eu_accounts";
        break;
      case 'NA':
        dbName = "na_accounts";
        break;
      case 'SEA':
        dbName = "sea_accounts";
        break;
      default:
        dbName = "genshin_accounts"; // For featured accounts
    }

    const database = client.db(dbName);
    const accounts = database.collection("accounts");
    
    let query = {};
    if (server) {
      query.server = server;
    } else {
      query.featured = true;
    }

    const fetchedAccounts = await accounts.find(query).toArray();
    
    res.json(fetchedAccounts);
  } catch (e) {
    console.error("Error fetching accounts:", e);
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

app.post('/insert-test-data', async (req, res) => {
  try {
    const server = req.body.server;
    let dbName;

    switch (server) {
      case 'EU':
        dbName = "eu_accounts";
        break;
      case 'NA':
        dbName = "na_accounts";
        break;
      case 'SEA':
        dbName = "sea_accounts";
        break;
      default:
        throw new Error("Invalid server specified");
    }

    const database = client.db(dbName);
    const accounts = database.collection("accounts");
    const testData = req.body.accounts;
    const result = await accounts.insertMany(testData);
    res.json({ message: `${result.insertedCount} documents inserted into ${dbName}` });
  } catch (e) {
    console.error("Error inserting test data:", e);
    res.status(500).json({ error: e.message });
  }
});

process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
