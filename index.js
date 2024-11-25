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
      const { distance } = req.body; // ESP8266 will send distance in the request body
  
      // Validate the incoming data
      if (typeof distance !== "number" || distance < 0) {
        return res.status(400).json({ error: "Invalid distance value" });
      }
  
      // Save the data to MongoDB
      const newSensorData = new SensorData({ distance });
      await newSensorData.save();
  
      res.status(201).json({ message: "Sensor data saved successfully" });
    } catch (error) {
      console.error("Error saving sensor data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

app.listen(PORT, "0.0.0.0", () => console.log(`Server is running on PORT: ${PORT}`));
