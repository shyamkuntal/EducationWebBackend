import { Roles, User } from "../../models/User.js";

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

export const createUser = async (req, res) => {
  const { Name, userName, email, password, roleId } = req.body;
  try {
    const user = await User.create({
      Name,
      userName,
      email,
      password,
      roleId,
    });

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(200).json({ msg: error.message });
  }
};
