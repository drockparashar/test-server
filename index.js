import express from "express";
import mongoose from 'mongoose';
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app=express();
const PORT=3001;

app.use(cors({ origin: '*' })); // For testing
app.use(express.json());

console.log(process.env.MONGO_URI)

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected..."));

const sensorDataSchema = new mongoose.Schema(
    {
      distance: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now, // Automatically add a timestamp
      },
    },
    { versionKey: false }
  );

const SensorData = mongoose.model("SensorData", sensorDataSchema);

  app.get("/", (req, res) => {
    res.send("Polyhouse Backend API");
  });

  app.post("/api/sensor-data", async (req, res) => {
    try {
      const { distances } = req.body; // Expecting an array of distances
  
      // Validate the incoming data
      if (!Array.isArray(distances) || distances.some(d => typeof d !== "number" || d < 0)) {
        return res.status(400).json({ error: "Invalid distances data" });
      }
  
      // Save each distance as a new document in MongoDB
      const sensorDataArray = distances.map(distance => ({ distance }));
      await SensorData.insertMany(sensorDataArray);
  
      res.status(201).json({ message: "Sensor data saved successfully" });
    } catch (error) {
      console.error("Error saving sensor data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
app.listen(PORT, "0.0.0.0", () => console.log(`Server is running on PORT: ${PORT}`));
