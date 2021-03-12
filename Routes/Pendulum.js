const express = require("express");
const { PendulumController } = require("../Controller/Pendulum");
const allowCrossDomain = require("../Helper/cors");

let pendulum = express();
pendulum.use(allowCrossDomain); // To allow cors request

/**
 * Handle all the routes for child process
 */

pendulum.get("/", PendulumController.getPosition);
pendulum.post("/Pause", PendulumController.pause);
pendulum.post("/Resume", PendulumController.resume);

module.exports = pendulum;