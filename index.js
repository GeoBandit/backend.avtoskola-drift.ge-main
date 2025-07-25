const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const PORT = process.env.PORT || 5000;


// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, ".env") });

// Initialize Express app
const app = express();

// Middleware
const cors = require("cors");

app.use(
  cors({
    origin: [
      "https://fronend-avtoskola-drift-ge-main.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // dbName: "Traffic-data", // Explicitly specify the database name
      dbName: "traffic-data", // Explicitly specify the database name
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,    // Recommended for Atlas
      w: "majority"          // Recommended for production
    });

    const connection = mongoose.connection;
    console.log(`MongoDB Connected: 
      Host: ${connection.host}
      Port: ${connection.port}
      Database: ${connection.name}`); // Will now show "Traffic-data"

    // Verify the database is being used
    const db = connection.db;
    console.log(`Collections in Traffic-data database:`, 
      (await db.listCollections().toArray()).map(col => col.name));

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    // Graceful shutdown with non-zero exit code
    process.exit(1);
  }
};

// Connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from DB");
});

// Import routes
const vehicleRoutes = require("./routes/vehicleRoutes");
const topicRoutes = require("./routes/topicRoutes");
const questionRoutes = require("./routes/questionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");


app.use("/api/vehicles", vehicleRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/admin", adminRoutes); // Fixed typo: Added leading slash '/'
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    status: "UP",
    database: dbStatus,
    dbName: mongoose.connection.db?.databaseName || "Not connected",
    timestamp: new Date().toISOString(),
  });
});

// Serve static files in production
// if (process.env.NODE_ENV === "production") {
  
//   app.use(express.static(path.join(__dirname, "../client/build"))); // Adjusted path for static files

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client/build", "index.html")); // Adjusted path for index.html
//   });
// }

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message,
  });
});

// API routes
app.use("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.json({
    message: "Welcome to the API",
  });

});

// Start server

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Mongoose disconnected through app termination");
  process.exit(0);
});
