const Role = require("../models/roleModel");
const Employee = require("../models/employeeModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
// const { where } = require("sequelize");

exports.getAllRoles = catchAsync(async (req, res, next) => {
  const roles = await Role.findAll({
    attributes: ["id", "name", "permissions", "approval_limit"],
    include: [
      {
        model: Employee,
        as: "employees",
        attributes: ["id", "name", "email"], // Only include fields you need
      },
    ],
  });

  res.status(200).json({
    status: "success",
    results: roles.length,
    data: {
      roles,
    },
  });
});
exports.getRole = catchAsync(async (req, res, next) => {
  const role = await Role.findOne({
    where: { id: req.params.id },
    attributes: ["id", "name", "permissions", "approval_limit"],
    include: [
      {
        model: Employee,
        as: "employees",
        attributes: ["id", "name", "email"],
      },
    ],
  });
  if (!role) return next(new AppError("There is no Role with this ID", 404));
  res.status(200).json({
    status: "success",
    data: {
      role,
    },
  });
});

exports.createRole = catchAsync(async (req, res, next) => {
  const { name, permissions, approval_limit } = req.body;

  const role = await Role.create({
    name,
    permissions,
    approval_limit,
  });

  res.status(201).json({
    status: "Success",
    data: { role },
  });
});

//Assiging roles to existing users
//Balez Admin only or ceo
exports.assignRole = catchAsync(async (req, res, next) => {
  const { employeeId, roleId } = req.body;

  const employee = await Employee.findByPk(employeeId);
  const role = await Role.findByPk(roleId);

  if (!employee || !role) {
    return next(new AppError("Person or Role not found", 404));
  }

  await employee.update({
    roleId: role.id,
    role: role.name,
  });

  res.status(200).json({
    status: "success",
    message: "Role assigned successfully",
    data: {
      person,
    },
  });
});

//Consider it like the protect method but it only checks the permission
exports.checkPermission = (requiredPermission) => {
  return catchAsync(async (req, res, next) => {
    const employee = await Employee.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          as: "employeeRole",
        },
      ],
    });

    if (!employee || !employee.employeeRole) {
      return next(new AppError("Access denied", 401));
    }

    const hasPermission =
      employee.employeeRole.permissions.includes(requiredPermission);

    if (!hasPermission) {
      return next(new AppError("Access Denied!!", 403));
    }

    next();
  });
};

exports.updateRole = catchAsync(async (req, res, next) => {
  const role = await Role.findByPk(req.params.id);
  if (!role) {
    return next(new AppError("role Not Found", 404));
  }
  const updatedRole = await role.update(req.body);
  res.status(200).json({
    status: "success",
    data: {
      updatedRole,
    },
  });
});
exports.deleteRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const role = await Role.findByPk(id);
  if (!role) {
    return next(new AppError("There is no Role with this ID", 404));
  }
  const rowsDeleted = await Role.destroy({
    where: { id },
  });

  if (rowsDeleted === 0) {
    return next(
      new AppError("Failed to delete Role, please try again later", 500)
    );
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});