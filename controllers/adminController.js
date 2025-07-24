const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwt');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = generateToken({ 
      username: admin.username, 
      role: admin.role,
      id: admin._id
    });

    res.json({ 
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createAdmin = async (req, res) => {
    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: "admin-id",
        username: "adminUser",
        role: "admin"
      }
    });
//   try {
//     const { username, password, role } = req.body;
    
//     const existingAdmin = await Admin.findOne({ username });
//     if (existingAdmin) {
//       return res.status(400).json({ error: "Admin already exists" });
//     }

//     const newAdmin = new Admin({ username, password, role });
//     await newAdmin.save();

//     res.status(201).json({
//       message: "Admin created successfully",
//       admin: {
//         id: newAdmin._id,
//         username: newAdmin.username,
//         role: newAdmin.role
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to create admin" });
//   }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve admins" });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (req.admin.id === id) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }

    const result = await Admin.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete admin" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const isPasswordValid = await admin.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect old password" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update password" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};