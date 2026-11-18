const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI ||
      'mongodb+srv://anshpatel1:anshpatel1@clusteransh.sgufmbi.mongodb.net/studentxchange?retryWrites=true&w=majority';
    await mongoose.connect(uri);
    console.log('MongoDB Connected Successfully to Atlas');
  } catch (error) {
    console.log('MongoDB connection failed:', error);
  }
};

module.exports = connectDB;
