import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";   // 👈 use the app with routes

dotenv.config({
  path: "./env"
});

// connect database
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Failed", error);
  });

app.on("error", (error) => {
  console.error("Express error:", error);
});














/*
import express from "express";
const app = express();
( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
           app.on('error', (error) => {
               console.error("MongoDB connection error:", error);
               throw error;
           }),

           app.listen(process.env.PORT, () => {
               console.log(`Server is running on port ${process.env.PORT}`);
           })
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
})();*/