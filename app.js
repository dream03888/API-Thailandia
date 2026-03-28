const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv').config({ path: path.join(__dirname, '.env') });
const http = require('http');
const { Pool } = require('pg');
const axios = require('axios');

// Initialize Express
const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '500mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

const PORT = process.env.PORT || 4300;
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = require('socket.io')(httpServer, { 
  cors: { origin: '*' }
});

// Initialize PostgreSQL Pool
const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT || 5432),
});

// Import shared logic/configs (if needed by other files)
// const google_api = require("./src/google_api.js");
// const login = require("./src/setting.js");


// Import Routes
const authRoutes = require('./src/routes/auth');
const hotelRoutes = require('./src/routes/hotels');
const agentRoutes = require('./src/routes/agents');
const tourRoutes = require('./src/routes/tours');
const transferRoutes = require('./src/routes/transfers');
const excursionRoutes = require('./src/routes/excursions');
const tripRoutes = require('./src/routes/trips');
const supplierRoutes = require('./src/routes/suppliers');
const userRoutes = require('./src/routes/users');
const markupRoutes = require('./src/routes/markups');
const otherChargeRoutes = require('./src/routes/other-charges');
const paymentRoutes = require('./src/routes/payments');

// Use Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/transfers', transferRoutes);
app.use('/api/v1/excursions', excursionRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/markups', markupRoutes);
app.use('/api/v1/other-charges', otherChargeRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Socket.io Events
pool.connect().then(() => {
  console.log("Connected to PostgreSQL");
  pool.query("LISTEN queue_trigger");
});

pool.on("notification", (msg) => {
  io.emit("queue_refresh");
});

io.on("connection", (socket) => {
  socket.on("register_display", () => socket.join("display"));
  socket.on("register_operator", () => socket.join("operator"));

  socket.on("call_queue", async (payload) => {
    try {
      // Placeholder for queue logic
      console.log("Call queue payload:", payload);
    } catch (err) {
      console.error(err);
    }
  });

  // Additional legacy socket events stubs
  socket.on("UpdatePassword", async (data) => {
    // const result = await login.UpdatePassword(data.newPassword, data.user_id);
    // socket.emit("return_UpdatePassword", result);
  });


  socket.on("transaction_insertUser", async (user , access , level ,admin) => {
    const result = await login.trasctionInsertUser(user , access , level ,admin);
    socket.emit("return_transaction_insertUser", result);
  });

  socket.on("getUser", async () => {
    const result = await login.getUser();
    socket.emit("return_getUser", result);
  });

  socket.on("insertLogStory", async (data) => {
    const result = await login.InsertLogLogin(data);
    socket.emit("return_insertLogStory", result);
  });

  socket.on("disconnect", () => {});
});

// Start Server
httpServer.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});

module.exports = { app, io, pool };
