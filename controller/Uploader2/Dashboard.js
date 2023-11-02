

const { Question } = require("../../models/Question");
const{UserSubjectMapping, User} = require("../../models/User")
const {SheetManagement} = require("../../models/SheetManagement");
const { subjectName, Subject } = require("../../models/Subject");
const { where } = require("sequelize");
const { SubBoard, Board } = require("../../models/Board");
const { Notice } = require("../../models/Notice");


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
      const id= req.query.id; 
      let filters = {}
      if (req.query.boardId) {
        filters.boardId = req.query.boardId;
      }
      if (req.query.subjectId) {
        filters.subjectId = req.query.subjectId;
      }
      if (req.query.subBoardId) {
        filters.subBoardId = req.query.subBoardId;
      }
      if (req.query.grade) {
        filters.grade = req.query.grade;
      }
      if (req.query.isSpam) {
        filters.isSpam = true
      }
      if (req.query.uploader2Id) {
        filters.uploader2Id = req.query.uploader2Id;
      }
      const Result = await Question.findAll({
        where: {
            isErrorByTeacher: true,
            isErrorByReviewer:true
        },
        include:[
        {
            model:SheetManagement,
            where:filters
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
      let Result;
      if(subjectNameId){
        Result = await SheetManagement.findAll({
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
      }
      else{
        Result = await SheetManagement.findAll({
          where: {
              uploader2Id: id,
              isSpam:false
          },
        }); 
      }
      
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
      // if(!subjectNameId){
      //   getAllSheetOfReportedError(req,res)
      // }
      let Result;
      if(subjectNameId){
        Result = await SheetManagement.findAll({
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
      }
      else{
       Result = await SheetManagement.findAll({
          where: {
              uploader2Id: id,
              isSpam:true
          },
        });
      }
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
      let Result;
      if(subjectNameId){
        Result = await Question.findAll({
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
      }
      else{
        Result = await Question.findAll({
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
          }
          ]
        });
      }
      
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

  async getAllNoticeForUploader2(req, res) {
    try {
      const userId = req.query.id; // Assuming boardId is passed in the request params
      const Result = await Notice.findAll({
        include:[
          {
            model:User
          }
        ],
        where: {
          reciever:userId,
          deleteByReciever:false,
          deleteBySender:false
        },
       
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async deleteNoticeFromReciver(req, res) {
    try {
      const userId = req.query.id; 
      const id = req.query.noticeId; 
      const result = await Notice.findOne({
        where: {
          id: id,
          reciever: userId,
        },
      });
      if (result) {
        await result.update({ deleteByReciever: true }, { fields: ['deleteByReciever'] });
        res.send(result);
      } else {
        res.status(404).send("Notice not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }    
  },


};

module.exports = { DashboardApi };
