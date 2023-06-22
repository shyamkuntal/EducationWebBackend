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
    reviewerAssignToSupervisorErrorReport:
      "found an error in the sheet and send back to",
  },
  sheetCheckList: {
    CheckListItem1: "Check List Item 1",
    CheckListItem2: "Check List Item 2",
    CheckListItem3: "Check List Item 3",
    CheckListItem4: "Check List Item 4",
    CheckListItem5: "Check List Item 5",
    CheckListItem6: "Check List Item 6",
    CheckListItem7: "Check List Item 7",
    CheckListItem8: "Check List Item 8",
    CheckListItem9: "Check List Item 9",
    CheckListItem10: "Check List Item 10",
  },
  validationRegex: {
    phoneRegex: /^[2-9]{1}[0-9]{7}/,
    emailRegex: /^\S+@\S+\.\S+$/,
    urlRegex: newFunction(),
  },
});
function newFunction() {
  return /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
}
