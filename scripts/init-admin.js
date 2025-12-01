const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Default admin credentials from environment variables or defaults
const DEFAULT_ADMIN = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
};

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

async function initAdmin() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/playstation-shop";
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: DEFAULT_ADMIN.username });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    await User.create({
      username: DEFAULT_ADMIN.username,
      password: hashedPassword,
    });

    console.log('✅ Admin user created successfully!');
    console.log('Username:', DEFAULT_ADMIN.username);
    console.log('Password:', DEFAULT_ADMIN.password);
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initAdmin();
