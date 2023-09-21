const { ApiError } = require("../../middlewares/apiError");
const services = require("../../services/index");
const httpStatus = require("http-status");
const db = require("../../config/database");
const CONSTANTS = require("../../constants/constants");
const { User } = require("../../models/User")
const { Notice } = require("../../models/Notice")
const { Op } = require("sequelize");

const { createNoticeSchema } = require('../../validations/NoticeValidation')

const NoticeController = {
  async createNotice(req, res, next) {
    const t = await db.transaction();
    try {
      let requestData = { ...req.body, sender: req.user.id }

      let values = await createNoticeSchema.validateAsync(requestData);
      let notice = await Notice.create(values, { transaction: t });

      await t.commit();
      res
        .status(httpStatus.CREATED)
        .send(notice);
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async getAllNotices(req, res, next) {
    try {

      let response = await Notice.findAll({
        where: { sender: req.user.id, deleteBySender: false },
        include: User,
        raw: true,
        nest: true,
        order: [
          ['createdAt', 'DESC'],
        ]
      });

      res
        .status(httpStatus.OK)
        .send(response);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getNoticeByName(req, res, next) {
    try {

      let users = await User.findAll({
        where: {
          Name: {
            [Op.like]: `${req.query.name}%`
          }
        }
      });

      let usersList = JSON.parse(JSON.stringify(users))
      let response = []
      for (var i = 0; i < usersList.length; i++) {
        let userId = usersList[i].id;
        let notices = await Notice.findAll({
          where: { reciever: userId, sender: req.user.id, deleteBySender: false }, include: User, raw: true, nest: true, order: [
            ['createdAt', 'DESC'],
          ]
        })

        response = [...JSON.parse(JSON.stringify(notices)), ...response]
      }

      res
        .status(httpStatus.OK)
        .send(response);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getNoticeByNameAndRole(req, res, next) {
    try {
      let roleDetails = await services.userService.findByRoleName(req.query.type);

      let users = await User.findAll({
        where: {
          Name: {
            [Op.like]: `${req.query.name}%`
          },
          roleId: roleDetails.id,
        },
      });

      let usersList = JSON.parse(JSON.stringify(users))
      let response = []
      for (var i = 0; i < usersList.length; i++) {
        let userId = usersList[i].id;
        let notices = await Notice.findAll({
          where: { reciever: userId, sender: req.user.id, deleteBySender: false }, include: User, raw: true, nest: true, order: [
            ['createdAt', 'DESC'],
          ]
        })

        response = [{ notices: JSON.parse(JSON.stringify(notices)), user: usersList[i] }, ...response]
      }

      res
        .status(httpStatus.OK)
        .send(response);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getDataGeneratorNotices(req, res, next) {
    try {

      let response = await Notice.findAll({
        where: { sender: req.user.id, deleteBySender: false, userType: CONSTANTS.roleNames.DataGenerator },
        include: User,
        raw: true,
        nest: true,
        order: [
          ['createdAt', 'DESC'],
        ]
      });

      let noticeList = JSON.parse(JSON.stringify(response))
      let Map = {};

      noticeList.forEach(element => {
        if (Map[element.user.id] === undefined) {
          Map[element.user.id] = [element];
        } else {
          Map[element.user.id].push(element);
        }
      });

      var result = []
      for (let key in Map) {
        result.push({ notices: Map[key], user: Map[key][0].user });
      }

      res
        .status(httpStatus.OK)
        .send(result);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getPricerNotices(req, res, next) {
    try {

      let response = await Notice.findAll({
        where: { sender: req.user.id, deleteBySender: false, userType: CONSTANTS.roleNames.Pricer },
        include: User,
        raw: true,
        nest: true,
        order: [
          ['createdAt', 'DESC'],
        ]
      });

      let noticeList = JSON.parse(JSON.stringify(response))
      let Map = {};

      noticeList.forEach(element => {
        if (Map[element.user.id] === undefined) {
          Map[element.user.id] = [element];
        } else {
          Map[element.user.id].push(element);
        }
      });

      var result = []
      for (let key in Map) {
        result.push({ notices: Map[key], user: Map[key][0].user });
      }

      res
        .status(httpStatus.OK)
        .send(result);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getTeacherNotices(req, res, next) {
    try {

      let response = await Notice.findAll({
        where: { sender: req.user.id, deleteBySender: false, userType: CONSTANTS.roleNames.Teacher },
        include: User,
        raw: true,
        nest: true,
        order: [
          ['createdAt', 'DESC'],
        ]
      });

      let noticeList = JSON.parse(JSON.stringify(response))
      let Map = {};

      noticeList.forEach(element => {
        if (Map[element.user.id] === undefined) {
          Map[element.user.id] = [element];
        } else {
          Map[element.user.id].push(element);
        }
      });

      var result = []
      for (let key in Map) {
        result.push({ notices: Map[key], user: Map[key][0].user });
      }

      res
        .status(httpStatus.OK)
        .send(result);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getUploaderNotices(req, res, next) {
    try {

      let response = await Notice.findAll({
        where: { sender: req.user.id, deleteBySender: false, userType: CONSTANTS.roleNames.Uploader2 },
        include: User,
        raw: true,
        nest: true,
        order: [
          ['createdAt', 'DESC'],
        ]
      });

      let noticeList = JSON.parse(JSON.stringify(response))
      let Map = {};

      noticeList.forEach(element => {
        if (Map[element.user.id] === undefined) {
          Map[element.user.id] = [element];
        } else {
          Map[element.user.id].push(element);
        }
      });

      var result = []
      for (let key in Map) {
        result.push({ notices: Map[key], user: Map[key][0].user });
      }

      res
        .status(httpStatus.OK)
        .send(result);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getReviewerNotices(req, res, next) {
    try {

      let response = await Notice.findAll({
        where: { sender: req.user.id, deleteBySender: false, userType: CONSTANTS.roleNames.Reviewer },
        include: User,
        raw: true,
        nest: true,
        order: [
          ['createdAt', 'DESC'],
        ]
      });

      let noticeList = JSON.parse(JSON.stringify(response))
      let Map = {};

      noticeList.forEach(element => {
        if (Map[element.user.id] === undefined) {
          Map[element.user.id] = [element];
        } else {
          Map[element.user.id].push(element);
        }
      });

      var result = []
      for (let key in Map) {
        result.push({ notices: Map[key], user: Map[key][0].user });
      }

      res
        .status(httpStatus.OK)
        .send(result);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getPastPaperNotices(req, res, next) {
    try {

      let response = await Notice.findAll({
        where: { sender: req.user.id, deleteBySender: false, userType: CONSTANTS.roleNames.PastPaper, deleteBySender: false },
        include: User,
        raw: true,
        nest: true,
        order: [
          ['createdAt', 'DESC'],
        ]
      });

      let noticeList = JSON.parse(JSON.stringify(response))
      let Map = {};

      noticeList.forEach(element => {
        if (Map[element.user.id] === undefined) {
          Map[element.user.id] = [element];
        } else {
          Map[element.user.id].push(element);
        }
      });

      var result = []
      for (let key in Map) {
        result.push({ notices: Map[key], user: Map[key][0].user });
      }

      res
        .status(httpStatus.OK)
        .send(result);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async getAllNotices(req, res, next) {
    try {

      let response = await Notice.findAll({
        where: { sender: req.user.id, deleteBySender: false },
        include: User,
        raw: true,
        nest: true,
        order: [
          ['createdAt', 'DESC'],
        ]
      });

      res
        .status(httpStatus.OK)
        .send(response);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async deleteNoticeForSender(req, res, next) {
    try {

      console.log(req.body)

      let result = await Notice.update({ deleteBySender: true }, {
        where: {
          id: req.body.id
        }
      });

      res
        .status(httpStatus.OK)
        .send(result);

    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};

module.exports = NoticeController;
