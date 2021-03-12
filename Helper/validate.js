const Joi = require("joi");
const { numberOfPednulum, mass, height, radius, angle } = require("../Config/config");

/**
 * 
 * @param {*} req  : Request object send by the client
 * @param {*} res  : Response object send back to the client
 * @param {*} next : Next function
 * 
 * Check the input data validation, if the response does not contain valid data,
 * it will send an error to the client
 */

let validateConfig = (req, res, next) => {

    // Validate the data type and value format
    const schema = Joi.array().length(numberOfPednulum).items(
        Joi.object({
            mass: Joi.number().min(mass.min).max(mass.max).required(),
            height: Joi.number().min(height.min).max(height.max).required(),
            radius: Joi.number().min(radius.min).max(radius.max).required(),
            angle: Joi.number().min(angle.min).max(angle.max).required()
                .messages({
                    'number.min': `"angle" should have a minimum value of -PI/2`,
                    'number.max': `"angle" should have a maximum value of PI/2`
                })
        })
    )

    let data = req.body.data;
    let result = schema.validate(data);

    if (result.error || !data) {
        return res.send({ success: false, message: "configuration validation fail", data: result.error });
    }

    let windResult = Joi.number().min(1).max(40).validate(req.body.wind);

    if (windResult.error || !req.body.wind) {
        return res.send({ success: false, message: "configuration validation fail", data: result.error });
    }

    // Validate two consecutive pendulums does not have the same values
    let shareParameter = false;
    for (let i = 0; i < numberOfPednulum - 1; i++) {
        if (data[i].mass === data[i + 1].mass
            || data[i].height === data[i + 1].height
            || data[i].radius === data[i + 1].radius
            || data[i].angle === data[i + 1].angle)
            shareParameter = true;
    }
    if (shareParameter)
        return res.send({
            success: false,
            message: "Two consecutive pendulums cannot have the same mass, length radius or angle"
        });

    next();
}

module.exports = {
    validateConfig: validateConfig
}