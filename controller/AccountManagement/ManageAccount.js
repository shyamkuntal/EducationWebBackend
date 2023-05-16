import { Roles } from "../../models/User.js";

export const createUserRole = async (req, res) => {
  const roles = [
    "Supervisor",
    "Superadmin",
    // "Uploader2",
    // "Teacher",
    // "Pricer",
    // "Reviewer",
    // "DataGenerator",
    // "PastPaper",
  ];
  try {
    const role = await Roles.bulkCreate(
      roles.map((roleName) => ({
        roleName,
      }))
    );
    return res.status(200).json({ role });
  } catch (error) {
    return res.status(200).json({ msg: error.message });
  }
};
