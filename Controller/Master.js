const cluster = require("cluster");
const { default: fetch } = require("node-fetch");
const { numberOfPednulum, childStartingPort } = require("../Config/config");
const { killCluster, createEnv } = require("../Helper/Cluster");

/**
 * 
 * @param {*} req : request received by the client
 * @param {*} res : response send back to the client
 * 
 * This function will kill all the child nodes if they exist. Once no child node are running,
 * it will create 5 child processes each one handling one pendulum
 */

let start = async (req, res) => {
    // Kill previous workers if service is already started 
    await killCluster();

    let pendulumAttribute = req.body.data;
    let wind = req.body.wind;

    // Start process for each pendulum on different ports
    for (let i = 0; i < numberOfPednulum; i++) {
        cluster.fork(createEnv(i, wind, pendulumAttribute[i]));
    }

    res.send({ success: true, message: `All pendulums are started` })
}

/**
 *
 * @param {*} req : request received by the client
 * @param {*} res : response send back to the client
 *
 * This function will handle the pause request. It will send pause request to all the child processes,
 * once all processes are paused it will send response back to the client
 */

let pause = async (req, res) => {
    // Check pendulum exist or not
    if (Object.keys(cluster.workers).length !== 0) {
        for (let i = 0; i < numberOfPednulum; i++)
            await requestWorker(childStartingPort + i, "Pause");
        return res.send({ success: true, message: "All pendulum are paused" })
    }

    return res.send({ success: true, message: "No pendulum were running" })
}

/**
 *
 * @param {*} req : request received by the client
 * @param {*} res : response send back to the client
 *
 * This function will handle the resume request. It will send resume request to all the child processes,
 * once all processes are resumed it will send response back to the client
 */

let resume = async (req, res) => {
    if (Object.keys(cluster.workers).length !== 0) {
        for (let i = 0; i < numberOfPednulum; i++)
            await requestWorker(childStartingPort + i, "Resume");
        return res.send({ success: true, message: "All pendulum are resumed" })
    }

    return res.send({ success: true, message: "No pendulum were running" })
}

/**
 * 
 * @param {number} portNumber   : port of the child process
 * @param {urlHandler} endPoint : url where the request need to be sent
 * 
 * This function will send request to the child processes and wait for the response from the
 * child node.
 */

let requestWorker = async (portNumber, endPoint) => {
    try { await fetch(`http://localhost:${portNumber}/${endPoint}`, { method: "POST" }); }
    catch (error) { console.log(error); }
}

/**
 *
 * @param {*} req : request received by the client
 * @param {*} res : response send back to the client
 *
 * This function will handle the stop request. It will kill the child processes and send
 * the response back to the client.
 */

let stop = async (req, res) => {
    if (Object.keys(cluster.workers).length !== 0) {
        await killCluster();
    }
    return res.send({ success: true, message: "All pendulums are stopped" })
}

module.exports = { server: { start, pause, resume, stop } }