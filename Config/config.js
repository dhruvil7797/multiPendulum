const numberOfPednulum = 5;
const mass = { min: 1, max: 50 };
const height = { min: 10, max: 300 };
const radius = { min: 10, max: 30 };
const angle = { min: -90, max: 90 };
const wind = { min: 1, max: 40 };
const canvas = { width: 900, height: 350, leftMargin: 100, rightMargin: 100 }
const serverPort = 3000;
const childStartingPort = 3001;
const fps = 15;
const clientFPS = 10;
const gravity = 9.82;
const safeDistance = 15;

const config = {
    numberOfPednulum, mass, height, radius, wind,
    angle, serverPort, childStartingPort, canvas, fps, gravity, safeDistance, clientFPS
}

module.exports = config;