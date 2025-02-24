module.exports = Object.freeze({
  questionType: {
    Text: "text",
    Image: "image",
    PDF: "pdf",
    Video: "video",
    Audio: "audio",
    Accordian: "accordian",
    Simulation: "simulation",
    Long_Answer: "longAnswer",
    MCQ_Single: "mcqSingle",
    MCQ_Multiple: "mcqMultiple",
    True_False: "trueFalse",
    Fill_Text: "fillText",
    Fill_Dropdown: "fillDropdown",
    Table: "table",
    Match: "match",
    Sort: "sort",
    Classify: "classify",
    Drawing: "drawing",
    Label_Drag: "labelDrag",
    Label_Fill: "labelFill",
    Hotspot: "hotspot",
    Desmos_Graph: "desmosGraph",
    Geogebra_Graph: "geogebraGraph",
  },
  sheetModelConstants: {
    defaultSheetLifeCycle: "Not Assigned",
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
    NotAssigned: "Not Assigned"
  },
  sheetStatuses: {
    NotStarted: "NotStarted",
    InProgress: "InProgress",
    Complete: "Complete",
  },
  sheetLogsMessages: {
    supervisorAssignToPastPaper: " Assigned sheet to past paper uploader ",
    supervisorAssignToDataGenerator: " Assigned sheet to Data Generator ",
    supervisorAssignToUploader2: " Assigned sheet to Uploader2 ",
    supervisorAssignToTeacher: " Assigned sheet to Teacher ",
    supervisorAssignToPricer: " Assigned sheet to Pricer ",
    supervisorAssignToReviewer: " Assigned task to reviewer ",
    reviewerAssignToSupervisor: "Completed sheet review and assigned back to",
    pricerAssignToSupervisor: "Completed sheet pricing and assigned back to",
    pastPaperrAssignToSupervisor: "Completed sheet assigned back to ",
    reviewerAssignToSupervisorErrorReport: "found an error in the sheet and send back to",
    DataGeneratorAssignToSupervisor: "Completed sheet assigned back to",
    uploaderAssignToSupervisor: "Completed sheet questions and assigned back to",
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
  grades: [
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th",
    "12th",
    "9th-10th",
    "11th-12th",
  ],
  modules: ["pastPaper", "paperNumber"],
  validationRegex: {
    phoneRegex: /^[2-9]{1}[0-9]{7}/,
    emailRegex: /^\S+@\S+\.\S+$/,
    urlRegex: newFunction(),
  },
});
function newFunction() {
  return /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
}
