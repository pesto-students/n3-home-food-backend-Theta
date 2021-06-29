const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const errorHandler = require('./config/error-handler');

app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(errorHandler)

const api = process.env.API_URL;

//Routes

const adminRoutes = require("./routes/admin");

app.use(`/${api}/admin`,adminRoutes);



//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log("Database Connection is ready...",api);
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT || 3000 
//Server
app.listen(PORT, () => {
  console.log(`server is running http://localhost:${process.env.PORT || 3000} `);
});
