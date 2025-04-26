const express = require("express");
const employeeController = require("../controllers/employeeController");
const router = express.Router();
const authController = require("../controllers/authController");
const { uploadMiddleware } = require("../utils/Upload");

router.use(authController.requireAuth);

router
  .route("/")
  .get(
    // authController.authorize([3, 4, 5, 6, 7]),
    employeeController.getAllEmployees
  )
  .post(
    authController.authorize([6, 7]),
    uploadMiddleware.employeeDocuments,
    employeeController.createEmployee
  );

router
  .route("/sorted/")
  .get(authController.authorize([6, 7]), employeeController.getEmployeesSorted);
router
  .route("/department/")
  .post(
    authController.authorize([3, 4, 5, 6, 7]),
    employeeController.getEmployeesByDepartment
  );
router
  .route("/myData")
  .get(
    authController.authorize([2, 3, 4, 5, 6, 7]),
    employeeController.getMyData
  )
  .patch(
    authController.authorize([2, 3, 4, 5, 6, 7]), // Add proper authorization
    uploadMiddleware.employeeDocuments,
    employeeController.updateMyData
  );
// .patch(employeeController.updateMyData);
router.route("/myOrders").get(
  // authController.authorize([2, 3, 4, 5, 6, 7]),
  employeeController.getMyOrders
);
router
  .route("/orders/:id")
  .get(authController.authorize([6, 7]), employeeController.getEmployeeOrders);
router
  .route("/:id/role")
  .patch(
    authController.authorize([6, 7]),
    employeeController.updateEmployeeRole
  );

router
  .route("/:id")
  .get(
    authController.authorize([2, 3, 4, 5, 6, 7]),
    employeeController.getEmployee
  )
  .patch(
    uploadMiddleware.employeeDocuments,
    // uploadMiddleware.signature,
    employeeController.updateEmployee
  )
  .delete(authController.authorize([6, 7]), employeeController.deleteEmployee);

// Delete employee document route
router.delete(
  "/:id/documents",
  // authController.authorize([6, 7]),
  employeeController.deleteEmployeeDocument
);

router
  .route("/signature/:id")
  .patch(
    authController.authorize([6, 7]),
    uploadMiddleware.signature,
    employeeController.updateEmployee
  );

router.patch(
  "/:id/documents", 
  authController.authorize([5, 6, 7]),
  uploadMiddleware.employeeDocuments,
  employeeController.updateEmployeeDocument
);

module.exports = router;
