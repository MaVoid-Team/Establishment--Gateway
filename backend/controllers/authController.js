// Create Auth controller

const catchAsync = require("../utils/catchAsync");
const {
  Employee,
  Role,
  notificationPreference,
  notificationType,
} = require("../models/assosciations");
const AppError = require("../utils/AppError");
const { encryptPassword, comparePassword } = require("../utils/helpers");
const sendMails = require("../utils/email");
const resetPasswordTemplate = require("../emailTemplates/resetPasswordTemplate");
const crypto = require("crypto");
const { Op } = require("sequelize");

exports.requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

exports.authorize = (allowedRoles) => {
  return (req, res, next) => {
    const role = req.session.user.role;
    // console.log(role);

    if (role && allowedRoles.includes(role)) {
      return next();
    }

    res.status(403).send("Access forbidden: Insufficient permissions", 403);
  };
};

exports.login = catchAsync(async (req, res, next) => {
  if (req.session.user) {
    return res.status(200).json({
      status: "Error",
      message: "Already logged in",
    });
  }

  let { password } = req.body;
  email = req.body.email.toLowerCase();
  // const user = await Employee.findOne({ where: { email }, include: "role" });

  const user = await Employee.findOne({
    where: { email },
    include: [
      { model: Role, as: "employeeRole" },
      {
        model: notificationType,
        attributes: { exclude: ["createdAt", "updatedAt"] },
        through: {
          model: notificationPreference,
          attributes: { exclude: ["employee_id", "createdAt", "updatedAt"] },
        },
      },
    ],
  });

  if (user) {
    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError("Invalid email or password", 401));
    }
  }

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  //the only way i get to the enabled toggle
  const obj = {};
  await user.notificationTypes.forEach(
    (el) => (obj[el.id] = !!el.notificationPreference?.is_enabled)
  );
  // console.log(obj);
  req.session.user = {
    id: user.id,
    name: user.name,
    role: user.employeeRole ? user.employeeRole.id : null,
    department: user.department_id, //dep id to allow user see the docs of the dep
    orderToggle: obj[1] || false,
    signatureToggle: obj[2] || false,
    contractToggle: obj[3] | false,
  };

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.logout = catchAsync(async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(new AppError("Error logging out. Please try again.", 500));
    }

    res.clearCookie("session");

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1)check passwords match
  const { password, confirmPassword } = req.body;

  if (password != confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }
  // 2) Get employee based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  // Find the employee with the hashed token and check if the token is still valid
  const employee = await Employee.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: new Date() },
    },
  });

  // 3) If token has not expired and employee exists, set the new password
  if (!employee) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // Update the employee's password and clear the reset token fields
  const hashPass = await encryptPassword(password);

  employee.password = hashPass;
  employee.passwordResetToken = null;
  employee.passwordResetExpires = null;

  // Save the updated employee
  await employee.save();

  // 4) Log the employee in and send a JWT

  res.status(200).json({
    status: "success",
    data: { employee },
  });
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Find the employee by email
  const emp = await Employee.findOne({ where: { email: req.body.email } });

  if (!emp) {
    return next(new AppError("No employee found with that email", 404));
  }

  // Generate reset token
  const resetToken = emp.createPasswordResetToken(); // Make sure this method is defined in your Employee model
  await emp.save({ validate: false }); // Disable validation during save

  // Build the reset URL
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;

  const htmlMessage = resetPasswordTemplate(resetURL);

  try {
    // Send the email
    await sendMails({
      email: emp.email,
      subject: "Your password reset token (valid for 10 minutes)",
      html: htmlMessage,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    // Revert changes if email sending fails
    emp.passwordResetToken = null;
    emp.passwordResetExpires = null;
    await emp.save({ validate: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});
exports.forgotPasswordById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!id) {
    return next(new AppError("Please provide an employee ID in the URL.", 400));
  }

  if (!newPassword) {
    return next(new AppError("Please provide a new password.", 400));
  }

  const employee = await Employee.findByPk(id);

  if (!employee) {
    return next(new AppError("No employee found with that ID.", 404));
  }

  employee.password = await encryptPassword(newPassword);

  await employee.save();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully.",
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  // Get employee from database
  const employee = await Employee.findByPk(req.session.user.id);

  // Check if current password is correct
  const isCurrentPasswordValid = comparePassword(
    currentPassword,
    employee.password
  );
  if (!isCurrentPasswordValid) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // Check if new password matches confirm password
  if (newPassword !== confirmPassword) {
    return next(
      new AppError("New password and confirm password do not match", 400)
    );
  }

  // Check if new password is same as old password
  const isSamePassword = comparePassword(newPassword, employee.password);
  if (isSamePassword) {
    return next(
      new AppError("New password cannot be the same as current password", 400)
    );
  }

  // Encrypt new password
  const encryptedPassword = await encryptPassword(newPassword);
  // Update password in database
  await employee.update({ password: encryptedPassword });

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});

// exports.Restrict = (Permission)=>{
//   return(req , res ,next)=>{

//     const EmpRole =  req.session?.user?.role_id;

//     if (!EmpRole) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'You must be logged in to access this route'
//       });
//     }

//     Role.findByPk(EmpRole)
//       .then(role => {
//         if (role.permissions.includes(Permission)) {
//           next();
//         } else {
//           res.status(403).json({
//             status: 'fail',
//             message: 'You do not have the required permission'
//           });
//         }
//           });
//         };
//   }
