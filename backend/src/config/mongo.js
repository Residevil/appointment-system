"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
exports.run = run;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { MONGO_USER, MONGO_PASSWORD, MONGO_CLUSTER_URL, MONGO_DB_NAME, } = process.env;
// guard against missing values
if (!MONGO_USER || !MONGO_PASSWORD || !MONGO_CLUSTER_URL) {
    throw new Error('Missing one of MONGO_USER, MONGO_PASSWORD or MONGO_CLUSTER_URL in .env');
}
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER_URL}/${MONGO_DB_NAME}?retryWrites=true&w=majority`;
exports.client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.client.connect();
            yield exports.client.db('admin').command({ ping: 1 });
            console.log('✅ Connected to MongoDB Atlas!');
        }
        catch (err) {
            console.error('❌ MongoDB connection failed:', err);
        }
        finally {
            // Ensures that the client will close when you finish/error
            yield exports.client.close();
        }
    });
}
