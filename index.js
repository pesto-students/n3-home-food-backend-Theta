const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./config/jwt");

const errorHandler = require('./config/error-handler');

app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(morgan("tiny"));
//app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

const api = process.env.API_URL;

//Routes

const adminRoutes = require("./routes/admin");
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const sellerRoutes = require("./routes/sellers");
const cartRoutes = require("./routes/cart");
const usersRoutes = require("./routes/users");
const razorpayRoutes = require("./routes/razorpay");
const ordersRoutes = require("./routes/orders");

app.use(`/${api}/admin`,adminRoutes);
app.use(`/${api}/categories`, categoriesRoutes);
app.use(`/${api}/products`, productsRoutes);
app.use(`/${api}/sellers`, sellerRoutes);
app.use(`/${api}/cart`,cartRoutes)
app.use(`/${api}/users`, usersRoutes);
app.use(`/${api}/razorpay`, razorpayRoutes);
app.use(`/${api}/orders`, ordersRoutes);

//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
  })
  .then(() => {
  })
  .catch((err) => {
  });

const PORT = process.env.PORT || 3000 
//Server
app.listen(PORT, () => {
});
