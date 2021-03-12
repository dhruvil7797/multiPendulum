const express = require("express");
const { json } = require("body-parser");
const allowCrossDomain = require("../Helper/cors");
const { serverPort } = require("../Config/config");
const config = require("../Config/config");
const { server } = require("../Controller/Master");
const { validateConfig } = require("../Helper/validate");

let master = express();

master.use(json()); // To read the body object
master.use(allowCrossDomain); // To allow cors request

/**
 * Handle all the routes for Master server
 */

master.get("/", (req, res) => {
    res.send({ success: true, message: `Server running on ${serverPort}` });
});

master.get("/config", (req, res) => {
    res.send({ success: true, message: "Config data sent", data: config });
});

master.post("/Start", validateConfig, server.start);
master.post("/Pause", server.pause);
master.post("/Resume", server.resume);
master.post("/Stop", server.stop);

module.exports = master;