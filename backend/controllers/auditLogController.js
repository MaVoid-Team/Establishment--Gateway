const SignatureLog = require("../models/signatureLogModel");
const DocumentLog = require("../models/documentLogModel");
const OrderLog = require("../models/orderLogModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const SalesContractLog = require("../models/salesContractsLogModel");
const Employee = require("../models/employeeModel");

// Controller for creating a signature log
exports.createSignatureLog = catchAsync(async (req, res, next) => {
  const log = await SignatureLog.create(req.body);
  res.status(201).json({
    status: "success",
    data: log,
  });
});

// Controller for retrieving all signature logs
exports.getAllSignatureLogs = catchAsync(async (req, res, next) => {
  const logs = await SignatureLog.findAll();
  res.status(200).json({
    status: "success",
    data: logs,
  });
});

// Controller for creating a document log
exports.createDocumentLog = catchAsync(async (req, res, next) => {
  const log = await DocumentLog.create(req.body);
  res.status(201).json({
    status: "success",
    data: log,
  });
});

// Controller for retrieving all document logs
exports.getAllDocumentLogs = catchAsync(async (req, res, next) => {
  const logs = await DocumentLog.findAll();
  res.status(200).json({
    status: "success",
    data: logs,
  });
});

// Controller for creating an order log
exports.createOrderLog = catchAsync(async (req, res, next) => {
  const log = await OrderLog.create(req.body);
  res.status(201).json({
    status: "success",
    data: log,
  });
});

// Controller for retrieving all order logs
exports.getAllOrderLogs = catchAsync(async (req, res, next) => {
  const logs = await OrderLog.findAll();
  res.status(200).json({
    status: "success",
    data: logs,
  });
});

exports.getAllSalesContractLogs = async (req, res) => {
  try {
    const logs = await SalesContractLog.findAll({
      include: [
        {
          model: Employee,
          as: 'performer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        logs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
