const { wind } = require("../Config/config");

module.exports = class Pendulum {

    constructor(id, mass, origin, len, radius, initAngle, left, right, windInp) {
        this.id = id;
        this.mass = mass;
        this.origin = origin;
        this.len = len;
        this.radius = radius;
        this.initAngle = initAngle / 180 * Math.PI;
        this.angV = 0;
        this.currentAngle = this.initAngle;
        this.left = left;
        this.right = right;
        this.damping = 0.996 - ((windInp / (wind.max * 1000)) * mass / 3);   // Estimating effect of wind on pendulum
        this.isPuase = false;
    }

    updatePosition(newAngle, newAngV) {
        this.currentAngle = newAngle;
        this.angV = newAngV;
    }

    reset() {
        this.currentAngle = this.initAngle;
        this.angV = 0;
        this.isPuase = false;
    }
}