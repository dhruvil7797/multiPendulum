const Bull = require("bull");
const { numberOfPednulum } = require("../Config/config");

const queue = new Array(numberOfPednulum);

for (let i = 0; i < numberOfPednulum; i++) {
    queue[i] = new Bull(`Queue${i}`, { defaultJobOptions: { removeOnComplete: true } })
}

/**
 * 
 * @param {string} message      : handle the message for each child process
 * @param {Pendulum} pendulum   : Pendulum for which, have to handle the message
 */
let handleMessage = (message, pendulum) => {
    if (message.data.signal === 'STOP') {
        pendulum.isPuase = true;
    }
    if (message.data.signal === 'RESTART') {
        if (pendulum.isPuase) {
            pendulum.reset();
        }
    }
}

module.exports = { queue, handleMessage };