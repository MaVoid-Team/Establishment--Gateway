const express = require("express");
const departmentController = require("../controllers/departmentController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.requireAuth);

// Department Routes
router
  .route("/")
  .get(
    // authController.authorize([3, 4, 5, 6, 7]),
    departmentController.getAllDepartments
  ) // Get all departments
  .post(
    authController.authorize([6, 7]),
    departmentController.createDepartment
  ); // Create a department
router
  .route("/:id")
  .get(
    authController.authorize([3, 4, 5, 6, 7]),
    departmentController.getDepartmentById
  ) // Get a department by ID
  .patch(
    authController.authorize([6, 7]),
    departmentController.updateDepartment
  ) // Update a department
  .delete(
    authController.authorize([6, 7]),
    departmentController.deleteDepartment
  ); // Delete a department

//the route to get all employees
router.route("/:departmentID/employees").get(
  // authController.authorize([6, 7]),
  departmentController.getAllEmployeePerDep
);
module.exports = router;
