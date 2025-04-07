import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.DB_STRING);
    console.log("MONGODB connected :");
  } catch (error) {
    console.log("MONGODB Connection Failed", error);
    process.exit(1);
  }
};

export default connectDB;
