const cluster = require("cluster");
const master = require("./Routes/Master");
const pendulumRoute = require("./Routes/Pendulum");
const { serverPort } = require("./Config/config");
const { PendulumController } = require("./Controller/Pendulum");
const { queue, handleMessage } = require("./Helper/queue");
const { convertEnvToPendulum } = require("./Helper/Pendulum");

// If the cluster is master, start listening on master port
if (cluster.isMaster) {
    master.listen(serverPort);
}

/**
 * If the process is a child process, create pendulum object using the environment variable
 * and start listening on the child port.
 * 
 */

else {
    let pend = convertEnvToPendulum(process.env);
    PendulumController.setPosition(pend);
    PendulumController.run();
    queue[pend.id].clean(0); // Clean all the provios message in the queue
    queue[pend.id].process((message) => handleMessage(message, pend));
    pendulumRoute.listen(process.env.port);
}

