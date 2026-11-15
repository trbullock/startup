const path = require('node:path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

const envResult = dotenv.config({ path: path.join(__dirname, '.env.local') });
if (envResult.error && envResult.error.code !== 'ENOENT') {
  throw envResult.error;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI must be set in service/.env.local or the service environment');
}

const client = new MongoClient(uri);
const db = client.db(process.env.MONGODB_DATABASE || 'startup');

const userCollection = db.collection('user');
const popularSpotsCollection = db.collection('popularSpots');
const chatMessagesCollection = db.collection('chatMessages');

async function connectToDatabase() {
  await client.connect();
  await db.command({ ping: 1 });
  console.log('Connected to MongoDB');
  return db;
}

module.exports = {
  connectToDatabase,
  userCollection,
  popularSpotsCollection,
  chatMessagesCollection,
};
