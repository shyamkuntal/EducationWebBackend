import { Sheet } from "../../models/Sheet";

export const getAssignedSheets = async (req, res) => {
  const assignedTo = req.params.userId;
  console.log(assignedTo);
  try {
    const allAssignedSheeets = await Sheet.findAll({ where: { assignedTo } });

    return res.json({ status: 200, AssignedSheets: allAssignedSheeets });
  } catch (error) {
    res.json({ status: 501, message: error.message });
  }
};
