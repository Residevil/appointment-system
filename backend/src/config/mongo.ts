import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_CLUSTER_URL,
    MONGO_DB_NAME,
} = process.env;

// guard against missing values
if (!MONGO_USER || !MONGO_PASSWORD || !MONGO_CLUSTER_URL) {
    throw new Error(
        'Missing one of MONGO_USER, MONGO_PASSWORD or MONGO_CLUSTER_URL in .env'
    );
}

const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER_URL}/${MONGO_DB_NAME}?retryWrites=true&w=majority`;
export const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});


export async function run() {
    try {
        await client.connect();
        await client.db('admin').command({ ping: 1 });
        console.log('✅ Connected to MongoDB Atlas!');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
