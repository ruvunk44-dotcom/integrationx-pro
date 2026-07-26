import { MongoClient } from 'mongodb'

const uri = process.env.MONGO_URL
const dbName = process.env.DB_NAME || 'devlearn'

let cached = global._mongo
if (!cached) cached = global._mongo = { client: null, promise: null }

export async function getDb() {
  if (cached.client) return cached.client.db(dbName)
  if (!cached.promise) cached.promise = new MongoClient(uri, { maxPoolSize: 5 }).connect()
  cached.client = await cached.promise
  return cached.client.db(dbName)
}
