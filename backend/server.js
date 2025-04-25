const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()

require("dotenv").config();


// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Import routes
const userRoutes = require("./routes/userRoutes")
const donationRoutes = require("./routes/donationRoutes")

// Use routes
app.use("/api/users", userRoutes)
app.use("/api/donations", donationRoutes)

// Basic route
app.get("/", (req, res) => {
  res.send("Food Donation API is running")
})

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
