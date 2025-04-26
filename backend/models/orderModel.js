const Sequelize = require("sequelize");
const db = require("../config/db");

const Order = db.define(
  "order",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    delivery_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    estimated_time: {
      type: Sequelize.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Estimated time cannot be null",
        },
        notEmpty: {
          msg: "Estimated time is required",
        },
      },
    },
    delivery_status: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Delivery status cannot be null",
        },
        notEmpty: {
          msg: "Delivery status is required",
        },
      },
    },
    payment_method: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Payment method cannot be null",
        },
        notEmpty: {
          msg: "Payment method is required",
        },
      },
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Creation date cannot be null",
        },
      },
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Price cannot be null",
        },
        isInt: {
          msg: "Price must be an integer",
        },
      },
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "title cannot be null",
        },
        notEmpty: {
          msg: "title are required",
        },
      },
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "description cannot be null",
        },
        notEmpty: {
          msg: "description are required",
        },
      },
    },
    notes: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    attachment: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    employee_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Employee ID cannot be null",
        },
        isInt: {
          msg: "Employee ID must be an integer",
        },
      },
    },
    company_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Customer ID cannot be null",
        },
        isInt: {
          msg: "Customer ID must be an integer",
        },
      },
    },
    current_approver_role_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
    },
    approval_chain: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [], // Will store the history of approvals/rejections
    },
    final_status: {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    priority: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    url: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
  },
  {
    timestamps: false,
    tableName: "orders",
  }
);

module.exports = Order;
