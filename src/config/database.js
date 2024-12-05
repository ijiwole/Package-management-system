const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');
    }catch(e){
        console.error('Database Connection failed', e.message);
        process.exit(1);
    }
}

module.exports = connectDB;