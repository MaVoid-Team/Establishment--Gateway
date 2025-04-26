const Department = require("../models/departmentModel"); // Import Department model
const Employee = require("../models/employeeModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const restrict = require("../utils/restrictions");
const Role = require("../models/roleModel");
// Create a new department
const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: "Department name is required." });
    }

    // Create the department
    const department = await Department.create({ name });
    res
      .status(201)
      .json({ message: "Department created successfully.", department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all departments
const getAllDepartments = catchAsync(async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.status(200).json({
      status: "success",
      data: { departments },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//fn that return employees with certain department
const getAllEmployeePerDep = catchAsync(async (req, res, next) => {
  const departmentID = req.params.departmentID;
  const data = await restrict(
    Employee,
    req.session.user.role,
    ["id", "name", "email", "role_name"],
    { department_id: departmentID }
  );
  const employees = data
    ? data
    : await Employee.findAll({
        where: { department_id: departmentID },
        attributes: [
          "id",
          "name",
          "email",
          "phone_number",
          "role_id",
          "role_name",
        ],
        include: [
          {
            model: Role,
            as: "employeeRole",
            attributes: ["name", "permissions"],
          },
        ],
        order: [["role_id", "DESC"]],
      });

  if (!employees || employees.length === 0) {
    return next(
      new AppError(
        "There is no Department with this ID or it has no employees",
        404
      )
    );
  }

  res.status(200).json({
    status: "success",
    results: employees.length,
    data: {
      employees,
    },
  });
});

// Get a single department by ID
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found." });
    }

    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: "Department name is required." });
    }

    // Find the department
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found." });
    }

    // Update the department
    department.name = name;
    await department.save();

    res
      .status(200)
      .json({ message: "Department updated successfully.", department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the department
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found." });
    }

    // Delete the department
    await department.destroy();
    res.status(200).json({ message: "Department deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getAllEmployeePerDep,
};
