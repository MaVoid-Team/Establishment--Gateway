const Employee = require("./employeeModel");
const Role = require("./roleModel");
const Order = require("./orderModel");
const Company = require("./companyModel");
const Department = require("./departmentModel");
const Document = require("./document");
const DepartmentDocument = require("./departmentDocument");
const EmployeeOrder = require("./employeeOrderModel");
const Notification = require("./notifications");
const EmployeeNotification = require("./employeeNotification");
const Vendor = require("./vendorModel");
const Ticket = require("./ticket");
const TicketAudit = require("./ticketAudit");
const Attachment = require("./attachment");
const Comment = require("./comment");
const Category = require("./category");
const Status = require("./status");
const Priority = require("./priority");
const Signature = require("./signatures");
const SignatureLog = require("./signatureLogModel");
const DocumentLog = require("./documentLogModel");
const OrderLog = require("./orderLogModel");
const CompanyRevenue = require("./companyRevenueModel");
const VendorRevenue = require("./vendorRevenueModel");
const SalesContract = require("./salesContracts");
const SalesContractLog = require("./salesContractsLogModel");
const notificationPreference = require("../models/notificationPreference");
const notificationType = require("../models/notificationType");

const setupAssociations = () => {
  // Role and Employee: One-to-Many
  Role.hasMany(Employee, {
    foreignKey: "role_id",
    as: "employees",
  });
  Employee.belongsTo(Role, {
    foreignKey: "role_id",
    as: "employeeRole",
  });

  // Sales Contract and Employee (for audit logging)
  Employee.hasMany(SalesContractLog, {
    foreignKey: "performed_by",
    as: "salesContractLogs",
  });

  SalesContractLog.belongsTo(Employee, {
    foreignKey: "performed_by",
    as: "performer",
  });

  // Vendor and SalesContract =>> One-to-Many
  Vendor.hasMany(SalesContract, {
    foreignKey: "vendor_id",
    as: "SalesContracts",
    allowNull: true,
  });
  SalesContract.belongsTo(Vendor, {
    foreignKey: "vendor_id",
    as: "vendorSales", // Changed from vendor
    allowNull: true,
  });

  // Company and SalesContract =>> One-to-Many
  Company.hasMany(SalesContract, {
    foreignKey: "company_id",
    as: "SalesContracts",
    allowNull: true,
  });
  SalesContract.belongsTo(Company, {
    foreignKey: "company_id",
    as: "companySales", // Changed from company
    allowNull: true,
  });
  //analytics relations

  // Sales Contract and its logs
  SalesContract.hasMany(SalesContractLog, {
    foreignKey: "sales_contract_id",
    as: "logs",
    onDelete: "NO ACTION",
  });

  SalesContractLog.belongsTo(SalesContract, {
    foreignKey: "sales_contract_id",
    as: "salesContract",
    onDelete: "NO ACTION",
  });

  // Employee and SignatureLogs: One-to-Many
  Employee.hasMany(SignatureLog, {
    foreignKey: "performed_by",
    as: "signatureLogs",
  });
  SignatureLog.belongsTo(Employee, {
    foreignKey: "performed_by",
    as: "performer",
  });

  // Signature and SignatureLogs: One-to-Many
  Signature.hasMany(SignatureLog, {
    foreignKey: "signature_id",
    as: "logs",
  });
  SignatureLog.belongsTo(Signature, {
    foreignKey: "signature_id",
    as: "signature",
  });

  // Employee and DocumentLogs: One-to-Many
  Employee.hasMany(DocumentLog, {
    foreignKey: "submitter_id",
    as: "documentLogs",
  });
  DocumentLog.belongsTo(Employee, {
    foreignKey: "submitter_id",
    as: "submitter",
  });

  // Document and DocumentLogs: One-to-Many
  Document.hasMany(DocumentLog, {
    foreignKey: "document_id",
    as: "logs",
  });
  DocumentLog.belongsTo(Document, {
    foreignKey: "document_id",
    as: "document",
  });

  // Employee and OrderLogs: One-to-Many
  Employee.hasMany(OrderLog, {
    foreignKey: "submitter_id",
    as: "orderLogs",
  });
  OrderLog.belongsTo(Employee, {
    foreignKey: "submitter_id",
    as: "submitter",
  });

  // Order and OrderLogs: One-to-Many
  Order.hasMany(OrderLog, {
    foreignKey: "order_id",
    as: "logs",
  });
  OrderLog.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order",
  });

  // Employee and Department: One-to-Many
  Department.hasMany(Employee, {
    foreignKey: "department_id", // Foreign key in the Employee model
    as: "employees", // Alias for employees in a department
  });
  Employee.belongsTo(Department, {
    foreignKey: "department_id", // Foreign key in the Employee model
    as: "department", // Alias for the department in an employee
  });

  Employee.hasMany(Signature, {
    foreignKey: "signer_id",
    constraints: false,
    scope: {
      signer_type: "employee",
    },
    as: "signatures",
  });

  Order.hasMany(Signature, {
    foreignKey: "object_id",
    constraints: false,
    scope: {
      object_type: "order",
    },
    as: "signatures",
  });

  Company.hasMany(Signature, {
    foreignKey: "signer_id",
    constraints: false,
    scope: {
      signer_type: "company",
    },
    as: "signatures",
  });

  Document.hasMany(Signature, {
    foreignKey: "object_id",
    constraints: false,
    scope: {
      object_type: "document",
    },
    as: "signatures",
  });

  SalesContract.hasMany(Signature, {
    foreignKey: "object_id",
    constraints: false,
    scope: {
      object_type: "sales_contract",
    },
    as: "signatures",
  });

  Vendor.hasMany(Signature, {
    foreignKey: "signer_id",
    constraints: false,
    scope: {
      signer_type: "vendor",
    },
    as: "signatures",
  });

  // Define the many-to-many relationship
  Employee.belongsToMany(Order, {
    through: EmployeeOrder,
    foreignKey: "employee_id",
    otherKey: "order_id",
    as: "Orders",
  });
  Order.belongsToMany(Employee, {
    through: EmployeeOrder,
    foreignKey: "order_id",
    otherKey: "employee_id",
    as: "notifiedEmployees",
  });
  Employee.hasMany(EmployeeOrder, {
    foreignKey: "employee_id",
    as: "emplyeeOrders",
  });
  Order.hasMany(EmployeeOrder, {
    foreignKey: "order_id",
    as: "employeeOrders",
  });
  EmployeeOrder.belongsTo(Employee, {
    foreignKey: "employee_id",
    as: "employee",
  });
  EmployeeOrder.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order",
  });

  // Company and Order: One-to-Many
  Company.hasMany(Order, {
    foreignKey: "company_id",
    as: "companyOrders",
  });
  Order.belongsTo(Company, {
    foreignKey: "company_id",
    as: "company",
  });

  // Department and Document: Many-to-Many (New Association)
  Department.belongsToMany(Document, {
    through: DepartmentDocument,
    foreignKey: "department_id",
    otherKey: "document_id",
    as: "documents", // Alias for the documents of a department
  });
  Document.belongsToMany(Department, {
    through: DepartmentDocument,
    foreignKey: "document_id",
    otherKey: "department_id",
    as: "departments", // Alias for the departments associated with a document
  });

  // Notifications and Employee: Many-to-Many

  Employee.hasMany(EmployeeNotification, {
    foreignKey: "employee_id",
    as: "employeeNotifications",
  });

  EmployeeNotification.belongsTo(Employee, {
    foreignKey: "employee_id",
    as: "employee",
  });

  // Notification -> EmployeeNotification
  Notification.hasMany(EmployeeNotification, {
    foreignKey: "notification_id",
    as: "employeeNotifications",
  });

  EmployeeNotification.belongsTo(Notification, {
    foreignKey: "notification_id",
    as: "notification",
  });

  Notification.belongsToMany(Employee, {
    through: EmployeeNotification,
    foreignKey: "notification_id",
    otherKey: "employee_id",
    as: "employees",
  });
  Employee.belongsToMany(Notification, {
    through: EmployeeNotification,
    foreignKey: "employee_id",
    otherKey: "notification_id",
    as: "Notification",
  });
  // Order has many Notification
  Order.hasMany(Notification, {
    foreignKey: "order_id",
    as: "Notification",
    onDelete: "CASCADE", // Delete notifications if the order is deleted
    onUpdate: "CASCADE",
  });

  notificationType.hasMany(Notification, {
    foreignKey: "notification_type_id",
  });

  Notification.belongsTo(notificationType, {
    foreignKey: "notification_type_id",
  });

  Employee.belongsToMany(notificationType, {
    through: notificationPreference,
    foreignKey: "employee_id",
  });

  notificationType.belongsToMany(Employee, {
    through: notificationPreference,
    foreignKey: "notification_type_id",
  });

  notificationPreference.belongsTo(notificationType, {
    foreignKey: "notification_type_id",
  });

  notificationPreference.belongsTo(Employee, {
    foreignKey: "employee_id",
  });

  // Notification belongs to Order
  Notification.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Employee has many Ticket created
  Employee.hasMany(Ticket, {
    foreignKey: "created_by",
    as: "createdTickets",
  });

  // Employee has many Tickets assigned
  Employee.hasMany(Ticket, {
    foreignKey: "assigned_to",
    as: "assignedTickets",
  });

  // Employee has many TicketAudit
  Employee.hasMany(TicketAudit, {
    foreignKey: "changed_by",
    as: "ticketAudits",
  });

  // Employee has many Comment
  Employee.hasMany(Comment, {
    foreignKey: "user_id",
    as: "comments",
  });

  // Vendor and Document =>> One-to-Many
  Vendor.hasMany(Document, {
    foreignKey: "vendor_id",
    as: "documents",
    allowNull: true,
  });
  Document.belongsTo(Vendor, {
    foreignKey: "vendor_id",
    as: "vendorDetails", // Changed from vendor
    allowNull: true,
  });

  // Company and Document =>> One-to-Many
  Company.hasMany(Document, {
    foreignKey: "company_id",
    as: "documents",
    allowNull: true,
  });
  Document.belongsTo(Company, {
    foreignKey: "company_id",
    as: "companyDetails", // Changed from company
    allowNull: true,
  });
  //analytics relations

  Company.hasOne(CompanyRevenue, {
    foreignKey: "company_id",
    as: "revenue_summary",
  });
  CompanyRevenue.belongsTo(Company, {
    foreignKey: "company_id",
    as: "company",
  });

  Vendor.hasOne(VendorRevenue, {
    foreignKey: "vendor_id",
    as: "revenue_summary",
  });

  VendorRevenue.belongsTo(Vendor, {
    foreignKey: "vendor_id",
    as: "vendor",
  });

  Status.hasMany(Ticket, {
    foreignKey: "status_id",
    as: "tickets",
  });

  Status.hasMany(TicketAudit, {
    foreignKey: "old_status_id",
    as: "oldStatusAudits",
  });

  Status.hasMany(TicketAudit, {
    foreignKey: "new_status_id",
    as: "newStatusAudits",
  });

  Priority.hasMany(Ticket, {
    foreignKey: "priority_id",
    as: "tickets",
  });

  Priority.hasMany(TicketAudit, {
    foreignKey: "old_priority_id",
    as: "oldPriorityAudits",
  });

  Priority.hasMany(TicketAudit, {
    foreignKey: "new_priority_id",
    as: "newPriorityAudits",
  });

  Category.hasMany(Ticket, {
    foreignKey: "category_id",
    as: "tickets",
  });

  Category.hasMany(TicketAudit, {
    foreignKey: "old_category_id",
    as: "oldCategoryAudits",
  });

  Category.hasMany(TicketAudit, {
    foreignKey: "new_category_id",
    as: "newCategoryAudits",
  });

  Ticket.belongsTo(Employee, {
    foreignKey: "created_by",
    as: "creator",
  });
  Ticket.belongsTo(Employee, {
    foreignKey: "assigned_to",
    as: "assignee",
  });
  Ticket.belongsTo(Status, {
    foreignKey: "status_id",
    as: "status",
  });
  Ticket.belongsTo(Priority, {
    foreignKey: "priority_id",
    as: "priority",
  });
  Ticket.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category",
  });
  Ticket.hasMany(Comment, {
    foreignKey: "ticket_id",
    as: "comments",
    onDelete: "CASCADE",
  });
  Ticket.hasMany(Attachment, {
    foreignKey: "ticket_id",
    as: "attachments",
    onDelete: "CASCADE",
  });
  Ticket.hasMany(TicketAudit, {
    foreignKey: "ticket_id",
    as: "audits",
  });

  Comment.belongsTo(Ticket, {
    foreignKey: "ticket_id",
    as: "ticket",
  });
  Comment.belongsTo(Employee, {
    foreignKey: "user_id",
    as: "user",
  });

  Attachment.belongsTo(Ticket, {
    foreignKey: "ticket_id",
    as: "ticket",
  });

  TicketAudit.belongsTo(Ticket, {
    foreignKey: "ticket_id",
    as: "ticket",
  });
  TicketAudit.belongsTo(Employee, {
    foreignKey: "changed_by",
    as: "changer",
  });
  TicketAudit.belongsTo(Status, {
    foreignKey: "old_status_id",
    as: "oldStatus",
  });
  TicketAudit.belongsTo(Status, {
    foreignKey: "new_status_id",
    as: "newStatus",
  });
  TicketAudit.belongsTo(Priority, {
    foreignKey: "old_priority_id",
    as: "oldPriority",
  });
  TicketAudit.belongsTo(Priority, {
    foreignKey: "new_priority_id",
    as: "newPriority",
  });
  TicketAudit.belongsTo(Category, {
    foreignKey: "old_category_id",
    as: "oldCategory",
  });
  TicketAudit.belongsTo(Category, {
    foreignKey: "new_category_id",
    as: "newCategory",
  });

  Signature.belongsTo(Employee, {
    foreignKey: "signer_id",
    constraints: false,
    as: "employeeSigner",
    scope: {
      signer_type: "employee",
    },
  });

  Signature.belongsTo(Vendor, {
    foreignKey: "signer_id",
    constraints: false,
    as: "vendorSigner",
    scope: {
      signer_type: "vendor",
    },
  });

  Signature.belongsTo(Company, {
    foreignKey: "signer_id",
    constraints: false,
    as: "companySigner",
    scope: {
      signer_type: "company",
    },
  });

  // Polymorphic Associations for Object
  Signature.belongsTo(Order, {
    foreignKey: "object_id",
    constraints: false,
    as: "orderObject",
    scope: {
      object_type: "order",
    },
  });

  Signature.belongsTo(Document, {
    foreignKey: "object_id",
    constraints: false,
    as: "documentObject",
    scope: {
      object_type: "document",
    },
  });

  Signature.belongsTo(SalesContract, {
    foreignKey: "object_id",
    constraints: false,
    as: "salesContractObject",
    scope: {
      object_type: "sales_contract",
    },
  });
};

// Set up the associations
setupAssociations();

module.exports = {
  Employee,
  Ticket,
  Role,
  Order,
  Company,
  EmployeeOrder,
  Department,
  DepartmentDocument,
  Document,
  Notification,
  EmployeeNotification,
  Vendor,
  Signature,
  SignatureLog,
  DocumentLog,
  OrderLog,
  VendorRevenue,
  CompanyRevenue,
  SalesContract,
  SalesContractLog,
  notificationPreference,
  notificationType,
};
