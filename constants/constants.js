module.exports = Object.freeze({
  sheetModelConstants: {
    defaultSheet: "Not Assigned",
  },
  roleNames: {
    Uploader2: "Uploader2",
    Teacher: "Teacher",
    Pricer: "Pricer",
    Reviewer: "Reviewer",
    DataGenerator: "DataGenerator",
    PastPaper: "PastPaper",
    Supervisor: "Supervisor",
    Superadmin: "Superadmin",
  },
  sheetStatuses: {
    NotStarted: "NotStarted",
    InProgress: "InProgress",
    Complete: "Complete",
  },
  sheetLogsMessages: {
    supervisorAssignToPastPaper: " assign sheet to past paper uploader name ",
    supervisorAssignToReviewer: " assign task to reviewer ",
    reviewerAssignToSupervisor: "completed sheet review and assigned back to",
  },
});
