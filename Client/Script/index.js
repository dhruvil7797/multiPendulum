let pendulumPositions = [];
let interval;
let isStop = true;
let isRunning = false;
let isPause = false;

/**
 * This function will handle the start button click. When the button is pressed, it will
 * first check is pendulum is paused or running, then will send an error message to the user
 * 
 * If not, then it will validate the values selected using the slider for the repetation.
 * As, the two consecutive pendulum should not have the same values. And if they have the same value
 * it will send a message to the user, if not, it will send a request to start the pendulums using
 * values. 
 */

let handleStart = (e) => {
    if (isPause) {
        return createSnackBar("Pendulum is already running. Click Resume", true);
    }

    if (isRunning) {
        return createSnackBar("Pendulum is already running.", true);
    }

    pendulumPositions = new Array(5);
    for (let i = 0; i < values.length - 1; i++) {
        if (values[i].mass === values[i + 1].mass
            || values[i].height === values[i + 1].height
            || values[i].radius === values[i + 1].radius
            || values[i].angle === values[i + 1].angle) {
            createSnackBar("Two consecutive pendulums cannot have the same mass, length radius or angle", true);
            return;
        }
    }

    createSnackBar("Starting the pendulum", false);
    // Send request to the backend and start the simulation process
    startServer();
}

/**
 * Sends a http request to the master node, for starting the child processes 1 each for the pendulums.
 * When the request is executed, there will be 5 child processes running each on its own port.
 * Each one will be representing a different pendulums.
 * 
 * Once the child process are started, update the pendulum position in the local array and also
 * start the simulate function which will periodically fetch the latest position and redraw the canvas
 */

let startServer = () => {
    try {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = async function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonData = await JSON.parse(xmlhttp.responseText);
                if (jsonData.success) {
                    isRunning = true;
                    isPause = false;
                    isStop = false;
                    update();
                    simulate();
                }
                else
                    throw error;
            }
        };
        xmlhttp.open("POST", `${baseURL + configData.serverPort}/Start`, true);
        xmlhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xmlhttp.send(JSON.stringify({ "wind": windValue, "data": values }));
    }
    catch (error) {
        createSnackBar("Error while starting the pendulum", true);
    }
}

/**
 * This function will handle the pause button click. When the button is pressed, it will
 * first check is pendulum is paused or stoped, then will send an error message to the user
 *
 * If not, then it will send a http request to the server to pause the pendulums. and change the
 * pause button into the resume button
 */

let handlePause = (e) => {
    if (isPause || isStop) {
        return createSnackBar("Pendulum is not running.", true);
    }
    try {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = async function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonData = await JSON.parse(xmlhttp.responseText);
                if (jsonData.success) {
                    clearInterval(interval);
                    isPause = true;
                    isRunning = false;
                    isStop = false;
                    document.getElementById("pause").innerHTML = "Resume";
                    document.getElementById("pause").onclick = handleResume;
                }
            }
        };
        xmlhttp.open("POST", `${baseURL + configData.serverPort}/Pause`, true);
        xmlhttp.send();
    }
    catch (error) {
        createSnackBar("Error while pausing the pendulum", true);
    }
}

/**
 * This function will handle the resume button click. When the button is pressed, it will
 * first verify that pendulum is paused, if it is not paused, then will send an 
 * error message to the user
 *
 * If not, then it will send a http request to the server to resume the pendulums. and change the
 * resume button into the pause button
 */

let handleResume = (e) => {
    if (!isPause) {
        return createSnackBar("Pendulum is not paused.", true);
    }
    try {
        createSnackBar("Resuming", false);
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = async function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonData = await JSON.parse(xmlhttp.responseText);
                if (jsonData.success) {
                    isPause = false;
                    isRunning = true;
                    isStop = false;
                    simulate();
                    document.getElementById("pause").innerHTML = "Pause";
                    document.getElementById("pause").onclick = handlePause;
                }
            }
        };
        xmlhttp.open("POST", `${baseURL + configData.serverPort}/Resume`, true);
        xmlhttp.send();
    }
    catch (error) {
        createSnackBar("Error while resuming the pendulum", true);
    }
}

/**
 * This function will handle the stop button click. When the button is pressed, it will
 * first verify that pendulum is not already stoped, if it is stoped, then will send an
 * error message to the user
 *
 * If not, then it will send a http request to the server to stop the pendulums. Once the
 * request will be executed, all the child processes will be killed. and the canvas will be cleared
 */
let handleStop = (e) => {
    if (isStop) {
        return createSnackBar("Pendulum is already stopped.", true)
    }
    try {
        createSnackBar("Stopping", false);
        document.getElementById("pause").innerHTML = "Pause";
        document.getElementById("pause").onclick = handlePause;
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = async function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonData = await JSON.parse(xmlhttp.responseText);
                if (jsonData.success) {
                    createSnackBar("Stopped ", false);
                    clearInterval(interval);
                    clearCanvas();
                    isStop = true;
                    isRunning = false;
                    isPause = false;
                    pendulumPositions = new Array(5);
                }
            }
        };
        xmlhttp.open("POST", `${baseURL + configData.serverPort}/Stop`, true);
        xmlhttp.send();
    }
    catch (error) {
        createSnackBar("Error while stoping the pendulum", true);
    }

}


/**
 * Execute the updateIndividual function for all the pendulums
 */
let update = () => {
    for (let i = 0; i < configData.numberOfPednulum; i++) {
        updateIndividual(i);
    }
}

/**
 * 
 * @param {number} i : id of the pendulum
 * 
 * Sends a http request to the child node, for getting the latest position of the pendulum
 * from the child processes. Once the latest position is received it will be stored in a local array.
 * 
 */
let updateIndividual = (i) => {
    try {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = async function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonData = await JSON.parse(xmlhttp.responseText);
                if (jsonData.success) {
                    pendulumPositions[jsonData.data.port - configData.childStartingPort] = jsonData.data;
                }
            }
        };
        xmlhttp.open("GET", `${baseURL + (configData.childStartingPort + i)}/`, true);
        xmlhttp.send();
    }
    catch (error) {
        createSnackBar("Error while updating the pendulum", true);
    }
}

/**
 * Execute the update and draw function with the interval of rate set in the config.js
 */

let simulate = () => {
    interval = setInterval(() => {
        draw();
        update();
    }, 1000 / configData.clientFPS);
}

/**
 * Clear the canvas and draw the pendulum using latest position
 */

let draw = () => {
    clearCanvas();
    for (let i = 0; i < pendulumPositions.length; i++) {
        if (pendulumPositions[i] !== undefined) {
            drawPendulum(pendulumPositions[i].origin, pendulumPositions[i].position, pendulumPositions[i].radius);
        }
    }
}

/**
 * Function to clear the canvas
 */

let clearCanvas = () => {
    let canvas = document.getElementById("myCanvas");
    let context = canvas.getContext('2d');
    context.beginPath();
    context.fillStyle = "rgba(55, 55, 55, 1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.stroke();
}

/**
 * 
 * @param {object} origin : x and y coordinates of the origin of the pendulum
 * @param {object} point  : x and y coordinates of the center of the bob
 * @param {number} radius : radius of the bob
 * 
 * Draw the pendulum using the origin, center and radius.
 */

let drawPendulum = (origin, point, radius) => {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 4;
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 4;
    ctx.moveTo(point.x + radius, point.y);
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = "#0075ff";
    ctx.lineWidth = 4;
    ctx.moveTo(point.x + radius, point.y);
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fill();

}