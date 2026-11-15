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
const userIdentityCollation = { locale: 'en', strength: 2 };

async function assertNoDuplicateValues(field, label, collation) {
  const options = collation ? { collation } : {};
  const duplicateExists = await userCollection.aggregate([
    { $match: { [field]: { $type: 'string' } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ], options).hasNext();

  if (duplicateExists) {
    throw new Error(`Cannot create the unique ${label} index because duplicate values already exist`);
  }
}

async function connectToDatabase() {
  await client.connect();
  await db.command({ ping: 1 });
  await assertNoDuplicateValues('email', 'email', userIdentityCollation);
  await assertNoDuplicateValues('username', 'username', userIdentityCollation);
  await userCollection.createIndex(
    { email: 1 },
    { unique: true, collation: userIdentityCollation },
  );
  await userCollection.createIndex(
    { username: 1 },
    { unique: true, collation: userIdentityCollation },
  );
  console.log('Connected to MongoDB');
  return db;
}

module.exports = {
  connectToDatabase,
  userCollection,
  popularSpotsCollection,
  chatMessagesCollection,
};
