import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/playstation-shop";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (globalThis as any)._mongoose || { conn: null, promise: null };

if (!cached) (globalThis as any)._mongoose = cached;

export async function connect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      // useNewUrlParser etc are defaults in mongoose v7
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default mongoose;
