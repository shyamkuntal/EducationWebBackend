

const { Question } = require("../../models/Question");
const{UserSubjectMapping} = require("../../models/User")
const {SheetManagement} = require("../../models/SheetManagement");
const { subjectName, Subject } = require("../../models/Subject");
const { where } = require("sequelize");


const DashboardApi = {
  async getAllSubjectByUserId(req, res) {
    try {
      const id = req.query.id
      const Result = await UserSubjectMapping.findAll({where:{userId:id},include:[{model:subjectName,include:[{model:Subject}]}]});
      res.send(Result);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error"); // Handle the error appropriately
    }
  },

  async getAllSheetByUserId(req, res) {
    try {
      const id = req.query.id;
      const Result = await SheetManagement.findAll({
        where: {
            uploader2Id: id,
            isSpam:false
        },
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllSheetOfReportedError(req, res) {
    try {
      const id = req.query.id;
      const Result = await SheetManagement.findAll({
        where: {
            uploader2Id: id,
            isSpam:true
        },
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllSpamQuestionByUSer(req, res) {
    try {
      const id= req.query.id; // Assuming boardId is passed in the request params
      const Result = await Question.findAll({
        where: {
            isErrorByTeacher: true,
            isErrorByReviewer:true
        },
        include:[
        {
            model:SheetManagement,
            where:{
                uploader2Id: id,
                 isSpam:true
            }
        }
        ]
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  
  async getAllSheetBySubjectIdandUserId(req, res){
    try {
      const id = req.query.id;
      const subjectId = req.query.subjectId
      const Result = await SheetManagement.findAll({
        where: {
            uploader2Id: id,
            isSpam:false,
        },
        include:{
          model:Subject,
          include:[{
            model:subjectName,
            where:{
               id:id
            }
          }
          ]
        }
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },


  async getAllReportedErrorBySubjectIdandUserId(req, res){
    try {
      const id = req.query.id;
      const subjectId = req.query.subjectId
      const Result = await SheetManagement.findAll({
        where: {
            uploader2Id: id,
            isSpam:true,
            subjectId:subjectId
        },
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  
  async getAllSpamQuestionBySubjectIdandUserId(req, res){
    try {
      const id= req.query.id; // Assuming boardId is passed in the request params
      const subjectId = req.query.subjectId
      const Result = await Question.findAll({
        where: {
            isErrorByTeacher: true,
            isErrorByReviewer:true
        },
        include:[
        {
            model:SheetManagement,
            where:{
                uploader2Id: id,
                 isSpam:true,
                 subjectId:subjectId
            }
        }
        ]
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  

};

module.exports = { DashboardApi };
