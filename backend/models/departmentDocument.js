const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DepartmentDocument = sequelize.define(
  "DepartmentDocument",
  {
    department_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "departments", // Refers to the 'departments' table
        key: "id",
      },
      onDelete: "CASCADE", // Optional: specify what happens when a department is deleted
    },
    document_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "documents", // Refers to the 'documents' table
        key: "id",
      },
      onDelete: "CASCADE", // Optional: specify what happens when a document is deleted
    },
  },
  {
    tableName: "department_documents", // Table name for the junction table
    timestamps: false, // No need for createdAt/updatedAt
  }
);

module.exports = DepartmentDocument;
