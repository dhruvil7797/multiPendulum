const cluster = require("cluster");
const { numberOfPednulum, childStartingPort, canvas } = require("../Config/config");

/**
 * 
 * @param {number} id       : id for the pendulum
 * @param {number} wind     : wind effect
 * @param {object} config   : other pendulum properties
 * @returns {object}        : containing all the properties required for creating pendulum object
 */
let createEnv = (id, wind, config) => {
    let spacing = (canvas.width - canvas.leftMargin - canvas.rightMargin) / (numberOfPednulum - 1);
    return {
        id: id,
        wind: wind,
        mass: config.mass,
        len: config.height,
        radius: config.radius,
        angle: config.angle,
        port: childStartingPort + id,
        originX: canvas.leftMargin + (id * spacing),
        originY: 0,
        left: id === 0 ? -1 : childStartingPort + id - 1,
        right: id === numberOfPednulum ? -1 : childStartingPort + id + 1
    }
}

/**
 * Send Kill request to all the child processes and wait until they all are killed
 */
let killCluster = () => {
    return new Promise((resolve, reject) => {
        const workerIDs = Object.keys(cluster.workers)
        if (workerIDs.length == 0) { return resolve() }

        const workers = workerIDs.map(id => cluster.workers[id]).filter(v => v);
        let firstRun = true

        const fn = () => {
            let workerAlive = false;
            workers.forEach(worker => {
                if (!worker.isDead()) {
                    workerAlive = true;
                    if (firstRun)
                        worker.process.kill();
                }
            })
            if (!workerAlive) {
                //Clear the interval when all workers are dead
                clearInterval(interval)
                return resolve()
            }
            firstRun = false;
        }
        const interval = setInterval(fn, 500)
    })
}

module.exports = { killCluster, createEnv };