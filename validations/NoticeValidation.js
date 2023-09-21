const Joi = require("joi");

const createNoticeSchema = Joi.object({
    sender: Joi.string().guid().required(),
    reciever: Joi.string().guid().required(),
    userType: Joi.string().required(),
    message: Joi.string().required(),
    subject: Joi.string().required(),
    deleteBySender: Joi.boolean(),
    deleteByReciever: Joi.boolean()
})

module.exports = { createNoticeSchema }