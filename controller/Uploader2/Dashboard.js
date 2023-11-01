

const { Question } = require("../../models/Question");
const{UserSubjectMapping} = require("../../models/User")
const {SheetManagement} = require("../../models/SheetManagement");
const { subjectName, Subject } = require("../../models/Subject");
const { where } = require("sequelize");
const { SubBoard, Board } = require("../../models/Board");


const DashboardApi = {
  async getAllSubjectByUserId(req, res) {
    try {
      const id = req.query.id
      const Result = await UserSubjectMapping.findAll({where:{userId:id},include:[{model:subjectName,include:[{model:Subject}]}]});
      res.send(Result);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
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
      const subjectNameId = req.query.subjectId
      console.log(subjectNameId,"id")
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
               id:subjectNameId
            }
          }
          ],
          where:{
            subjectNameId:subjectNameId
          }
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
      const subjectNameId = req.query.subjectId
      const Result = await SheetManagement.findAll({
        where: {
            uploader2Id: id,
            isSpam:true,
        },
        include:{
          model:Subject,
          include:[{
            model:subjectName,
            where:{
               id:subjectNameId
            }
          },
          
          ]
          ,
          where:{
            subjectNameId:subjectNameId
          }
        }
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
      const subjectNameId = req.query.subjectId
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
            },
            include:{
              model:Subject,
              include:[{
                model:subjectName,
                where:{
                   id:subjectNameId
                }
              }
              ],
              where:{
                subjectNameId:subjectNameId
              }
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
  
  async getAllBoards(req, res) {
    try {
      const Result = await Board.findAll();
      res.send(Result);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error"); // Handle the error appropriately
    }
  },

  async getAllSubBoards(req, res) {
    try {
      const boardId = req.query.id; // Assuming boardId is passed in the request params
      console.log(boardId, "id");
      const Result = await SubBoard.findAll({
        where: {
          boardId: boardId,
        },
      });

      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllSubjects(req, res) {
    try {
      const boardId = req.query.id;
      const grade = req.query.grade; // Assuming boardId is passed in the request params
      const Result = await Subject.findAll({
        where: {
          subBoardId: boardId,
          grade: grade,
        },
        include: ["subjectName"], // Include the associated Child model
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllgrades(req, res) {
    try {
      const boardId = req.query.id; // Assuming boardId is passed in the request params
      const Result = await SheetManagement.findAll({
        where: {
          subBoardId: boardId,
        },
      });

      let gradeSet = new Set(); // Create a Set to store unique grades

      Result.forEach((sheet) => {
        if (sheet.grade) {
          gradeSet.add(sheet.grade);
        }
      });

      const gradeArray = Array.from(gradeSet); //

      res.send(gradeArray);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

};

module.exports = { DashboardApi };
