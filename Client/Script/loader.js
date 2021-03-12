var configData;
let baseURL = "http://localhost:"

/**
 * Document onLoad event Handler. When the document is loaded this function will be executed.
 * This function will fetch the configuration for the pendulums from the backend server.
 * Once the configuration is fetched, it will load the sliders and the buttons required for the
 * execution of the pendulums.
 * 
 * If the loadConfig request is failed, it will be considered as server is not running. So, its
 * will display an alert with button, if Ok button is pressed, it will reload the page and try to
 * connect again with the server
 */

window.onload = async function () {
    configData = await loadConfig();
    if (configData !== undefined) {
        createSnackBar("Server connected", false);
        initValues();
        loadControllers();
    }
    else {
        let ans = confirm("Error while connecting to the server. Press OK to reload the webpage");
        if (ans === true)
            location.reload();
    }
};

/**
 * Document onbeforeunload event Handler. When the document is closed this function will be executed.
 * This function will send a http reqeust to the server for stoping the pendulum.
 */
window.onbeforeunload = function () {
    clearInterval(interval);
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", `${baseURL + configData.serverPort}/Stop`, true);
    xmlhttp.send();
}

let loadConfig = async () => {
    return new Promise((resolve, reject) => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = async function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonData = await JSON.parse(xhttp.responseText);
                resolve(jsonData.data);
            }
            else if (this.readyState == 4 && this.status == 0) {
                resolve(undefined);
            }
        };
        xhttp.open("GET", `${baseURL + "3000"}/config`, true);
        xhttp.send();
    })
}

let titles = ['Attribute', 'Pendulum 1', 'Pendulum 2', 'Pendulum 3', 'Pendulum 4', 'Pendulum 5'];
let attributes = ['Mass', 'Height', 'Radius', 'Angle'];
let range, values, windValue;

const initValues = () => {
    range = [configData.mass, configData.height, configData.radius, configData.angle];
    let massAvg = parseInt("" + (((configData.mass.max - configData.mass.min) / 2) + configData.mass.min));
    let heightAvg = parseInt("" + (((configData.height.max - configData.height.min) / 2) + configData.height.min));
    let radiusAvg = parseInt("" + (((configData.radius.max - configData.radius.min) / 2) + configData.radius.min));
    let angleAvg = parseInt("" + (((configData.angle.max - configData.angle.min) / 2) + configData.angle.min));
    values = []
    for (let i = 0; i < configData.numberOfPednulum; i++) {
        values.push({
            mass: massAvg + i,
            height: heightAvg + i,
            radius: radiusAvg + i,
            angle: angleAvg + i
        })
    }
    windValue = ((configData.wind.max - configData.wind.min) / 2) + configData.wind.min;
}

const loadControllers = () => {
    loadTitles();
    loadSliders();
    loadProcessController();
}

const loadTitles = () => {
    let pendulumContainer = document.getElementById("pendulumController");
    let titleDiv = document.createElement("div");
    titleDiv.className = "row";
    for (let i = 0; i < titles.length; i++) {
        let cellDiv = document.createElement("div");
        cellDiv.className = "cell";
        cellDiv.innerHTML = titles[i];
        titleDiv.appendChild(cellDiv);
    }
    pendulumContainer.appendChild(titleDiv);
}

const loadSliders = () => {
    let pendulumContainer = document.getElementById("pendulumController");

    for (let i = 0; i < attributes.length; i++) {
        let sliderDiv = document.createElement("div");
        sliderDiv.className = "row";
        for (let j = 0; j < titles.length; j++) {
            if (j === 0) {
                let cellDiv = document.createElement("div");
                cellDiv.className = "cell";
                cellDiv.innerHTML = attributes[i];
                if (i === attributes.length - 1) {
                    cellDiv.innerHTML += " (Degree)"
                }
                sliderDiv.appendChild(cellDiv);
            }
            else {
                let div = document.createElement("div");
                div.className = "cell";
                let controlSilder = createSlider(range[i].min, range[i].max, values[j - 1][attributes[i].toLowerCase()], attributes[i] + j);
                controlSilder.style.width = "70%";
                let valueDiv = document.createElement("div");
                valueDiv.innerHTML = parseInt("" + controlSilder.value);
                controlSilder.oninput = (event) => {
                    values[j - 1][attributes[i].toLowerCase()] = parseInt(event.target.value);
                    valueDiv.innerHTML = parseInt(event.target.value);
                }
                div.appendChild(controlSilder);
                div.appendChild(valueDiv);
                sliderDiv.appendChild(div);
            }
        }
        pendulumContainer.appendChild(sliderDiv);
    }
}

const loadProcessController = () => {
    let processController = document.getElementById("processController");
    let windDiv = document.createElement("div");
    windDiv.id = "windDiv";
    let titleDiv = document.createElement("div");
    titleDiv.innerHTML = "Wind";
    let windSlider = createSlider(configData.wind.min, configData.wind.max, windValue, "wind");
    let valueDiv = document.createElement("div");
    valueDiv.innerHTML = parseInt("" + windValue);
    windSlider.oninput = (event) => {
        windValue = parseInt(event.target.value);
        valueDiv.innerHTML = parseInt(event.target.value);
    }
    windDiv.appendChild(titleDiv);
    windDiv.appendChild(windSlider);
    windDiv.appendChild(valueDiv);
    processController.appendChild(windDiv);

    let startButton = createButton("Start", "processButton", handleStart, "start");
    let pauseButton = createButton("Pause", "processButton", handlePause, "pause");
    let stopButton = createButton("Stop", "processButton", handleStop, "stop");

    processController.appendChild(startButton);
    processController.appendChild(pauseButton);
    processController.appendChild(stopButton);
}

const createButton = (title, className, handler, id) => {
    let button = document.createElement("button");
    button.innerHTML = title;
    button.className = className;
    button.id = id;
    button.onclick = handler;
    return button;
}

const createSlider = (minValue, maxValue, curValue, sliderId) => {
    let slider = document.createElement("input");
    slider.type = "range";
    slider.min = minValue;
    slider.max = maxValue;
    slider.value = curValue;
    slider.id = sliderId;
    return slider;
}


let timeout = -1;
let createSnackBar = (text, isError) => {
    clearTimeout(timeout);
    let snackBar = document.getElementById("snackBar");
    snackBar.innerHTML = text;
    snackBar.className = "show";
    snackBar.style.backgroundColor = isError ? "red" : "turquoise";

    timeout = setTimeout(() => {
        snackBar.innerHTML = "";
        snackBar.className = "hide";
    }, 3000)
}