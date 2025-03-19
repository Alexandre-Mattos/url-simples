/* eslint-disable */
const express = require("express");
const cors = require("cors");

const app = express();
const routes = require("./routes/routes");

app.use(
  cors({
    origin: true,
  })
);
app.use("/", routes);

module.exports = app;
