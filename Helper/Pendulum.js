const { default: fetch } = require("node-fetch");
const { safeDistance } = require("../Config/config");
const { queue } = require("../Helper/queue");
const Pendulum = require("../Model/Pendulum");

/**
 * 
 * @param {number} ang      : the angle of the pendulum
 * @param {number} len      : the lenght of the rod
 * @param {object} origin   : origin where the pendulum will start from
 * @returns {object} point  : point containing the center for the bob
 */
let calculatePoint = (ang, len, origin) => {
    return {
        x: (len * Math.sin(ang)) + origin.x,
        y: (len * Math.cos(ang)) + origin.y
    }
}

/**
 * 
 * @param {object} pointA   : point for the first pendulum
 * @param {object} pointB   : point for the second pendulum
 * @param {number} radiusA  : radius of the first pendulum
 * @param {number} radiusB  : radius of the second pendulum
 * @returns {number}        : returns the distance between two pendulums
 * 
 */
let calculateDistance = (pointA, pointB, radiusA, radiusB) => {
    let diffX = pointA.x - pointB.x;
    let diffY = pointA.y - pointB.y
    var distanceBetweenCenter = Math.sqrt(diffX * diffX + diffY * diffY);
    return distanceBetweenCenter - (radiusA + radiusB);
}

/**
 * 
 * @param {object} pendulumA        : object storing the value of pendulum 
 * @param {number} newAngle         : new angle based on the new position
 * @param {number} neighbourPort    : port id of the neighbour pendulum
 * @returns {boolean}               : return is the new position safe or not
 */
let isSafe = async (pendulumA, newAngle, neighbourPort) => {
    if (neighbourPort === -1)
        return true;

    try {
        var response = await fetch(`http://localhost:${neighbourPort}/`);
    }
    catch (error) {
        return true;
    }

    let neighbourData = await response.json();

    let pointA = calculatePoint(newAngle, pendulumA.len, pendulumA.origin);
    let distance = calculateDistance(pointA, neighbourData.data.position, pendulumA.radius, neighbourData.data.radius);
    return distance > safeDistance;
}

/**
 * Function which will send the STOP and RESTART signal when the distance is not safe
 */
let panic = async () => {
    for (let i = 0; i < queue.length; i++) {
        await queue[i].add({ signal: 'STOP' });
        await queue[i].add({ signal: 'RESTART' }, { delay: 5000 });
    }
}

/**
 * 
 * @param {object} env  : Values passes as environment to the child processes
 * @returns {Pendulum}  : Pendulum object with all the properties set using the env
 */
let convertEnvToPendulum = (env) => {
    return new Pendulum(
        parseInt(env.id), parseInt(env.mass),
        { x: parseInt(env.originX), y: parseInt(env.originY) },
        parseInt(env.len), parseInt(env.radius), parseInt(env.angle),
        parseInt(env.left), parseInt(env.right),
        parseInt(env.wind));
}

module.exports = { isSafe, panic, calculatePoint, convertEnvToPendulum }