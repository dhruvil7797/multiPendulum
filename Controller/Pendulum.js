const { fps, gravity } = require("../Config/config");
const { isSafe, panic } = require("../Helper/Pendulum");
const { queue } = require("../Helper/queue");
const { calculatePoint } = require("../Helper/Pendulum");

let pendulumPosition = undefined;
var updateInterval = undefined;

/**
 * This function will update the pendulum position, using the gravity, wind, and angular velocity.
 * Once the new position is calculated, it will check for the collison with left and right node.
 * If both are safe, then only it will update the position, if not it will call the panic function.
 * Panic function will send stop signal to all child processes
 */
let updatePosition = async () => {
    if (pendulumPosition.isPuase)
        return;

    let angA = (-0.1 * gravity / pendulumPosition.len) * Math.sin(pendulumPosition.currentAngle);
    let newAngV = (pendulumPosition.angV + angA) * pendulumPosition.damping;
    let newAngle = pendulumPosition.currentAngle + newAngV;

    let leftNodeIsSafe = await isSafe(pendulumPosition, newAngle, pendulumPosition.left);
    let rightNodeIsSafe = await isSafe(pendulumPosition, newAngle, pendulumPosition.right);

    if (leftNodeIsSafe && rightNodeIsSafe)
        pendulumPosition.updatePosition(newAngle, newAngV);
    else
        panic();
}

/**
 *
 * @param {*} req : request received by the client
 * @param {*} res : response send back to the client
 *
 * This function will return the current position of the pendulum to the client
 */

let getPosition = (req, res) => {
    res.send({
        success: true,
        message: "Data received",
        data: {
            port: parseInt(process.env.port),
            mass: pendulumPosition.mass,
            origin: pendulumPosition.origin,
            len: pendulumPosition.len,
            radius: pendulumPosition.radius,
            angle: pendulumPosition.currentAngle,
            position: calculatePoint(pendulumPosition.currentAngle, pendulumPosition.len, pendulumPosition.origin)
        }
    })
}

/**
 * 
 * @param {*} pend : Object for the pendulum model
 * 
 * This function will set the pendulum value using the argument.
 */
let setPosition = (pend) => {
    pendulumPosition = pend;
}

/**
 * This function will execute the updatePosition function at a given interval
 */
let run = () => {
    updateInterval = setInterval(updatePosition, 1000 / fps);
}

/**
 *
 * @param {*} req : request received by the client
 * @param {*} res : response send back to the client
 *
 * This will pause updating of the pendulum.
 */
let pause = (req, res) => {
    if (updateInterval) {
        queue[pendulumPosition.id].pause();
        clearInterval(updateInterval);
        updateInterval = undefined;
    }
    res.send({ success: true, message: "Process paused" })
}

/**
 *
 * @param {*} req : request received by the client
 * @param {*} res : response send back to the client
 *
 * This will resume updating of the pendulum.
 */
let resume = (req, res) => {
    queue[pendulumPosition.id].resume();
    run();
    res.send({ success: true, message: "Process resumed" });
}

module.exports = { PendulumController: { getPosition, run, setPosition, pause, resume } }