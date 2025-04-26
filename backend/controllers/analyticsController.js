// controllers/analyticsController.js

const Analytics = require("../models/analyticsModel");
const { Document, Order, SalesContract, Signature, Ticket } = require("../models/assosciations");
const db = require("../config/db");
const { Sequelize } = db;
const { Op } = require("sequelize");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
// Create a new Analytics record
exports.createAnalytics = async (req, res) => {
  const {
    report_date,
    repeated_vendors_count,
    total_sales_contracts_revenue,
    total_sales_contracts_amount_to_be_paid,
    total_sales_contracts_value,
    total_spent_on_orders,
    total_revenue,
  } = req.body;

  try {
    const newAnalytics = await Analytics.create({
      report_date,

      total_sales_contracts_revenue,
      total_sales_contracts_amount_to_be_paid,
      total_sales_contracts_value,
      total_spent_on_orders,
      total_revenue,
      total_contract_value_of_all_contracts,
      total_contract_value_of_all_contracts_except_sales,
    });

    res.status(201).json(newAnalytics);
  } catch (error) {
    console.error("Error creating analytics record:", error);
    res.status(500).json({
      error: "An error occurred while creating the analytics record.",
    });
  }
};

// Get all Analytics records
exports.getAllAnalytics = async (req, res, next) => {
  try {
    // Retrieve all analytics records (monthly snapshots)
    const analyticsRecords = await Analytics.findAll();

    // Get lifetime totals (from the very beginning)
    const totalOrders = await Order.count();
    const totalTickets = await Ticket.count();
    const totalSignatures = await Signature.count({
      where: { signature_data: { [Op.not]: null } },
    });

    return res.status(200).json({
      status: "success",
      data: {
        analytics: analyticsRecords,
        lifetime_totals: {
          total_orders: totalOrders,
          total_signatures: totalSignatures,
          total_tickets: totalTickets,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return next(new AppError("Failed to fetch analytics", 500));
  }
};

// Get a single Analytics record by report_date
exports.getAnalyticsByDate = catchAsync(async (req, res, next) => {
  const { report_date } = req.params;
  const startDate = `${report_date}-01 00:00:00`; // Start of the month
  const endDate = `${report_date}-31 23:59:59`; // End of the month (covers all days)
  const analytics = await Analytics.findOne({
    where: {
      report_date: {
        [Op.between]: [startDate, endDate], // Match records within the month
      },
    },
  });
  if (!analytics) {
    return next(
      new AppError("Analytics record not found for the specified date.", 404)
    );
  }
  res.status(200).json({
    status: "success",
    data: { analytics },
  });
});

// Update an Analytics record by report_date
exports.updateAnalytics = async (req, res) => {
  const { report_date } = req.params;
  const {
    repeated_vendors_count,
    total_sales_contracts_revenue,
    total_sales_contracts_amount_to_be_paid,
    total_sales_contracts_value,
    total_spent_on_orders,
    total_revenue,
    total_contract_value_of_all_contracts,
    total_contract_value_of_all_contracts_except_sales,
  } = req.body;

  try {
    const analytics = await Analytics.findOne({ where: { report_date } });

    if (!analytics) {
      return res
        .status(404)
        .json({ error: "Analytics record not found for the specified date." });
    }

    await analytics.update({
      total_sales_contracts_revenue:
        total_sales_contracts_revenue !== undefined
          ? total_sales_contracts_revenue
          : analytics.total_sales_contracts_revenue,
      total_sales_contracts_amount_to_be_paid:
        total_sales_contracts_amount_to_be_paid !== undefined
          ? total_sales_contracts_amount_to_be_paid
          : analytics.total_sales_contracts_amount_to_be_paid,
      total_sales_contracts_value:
        total_sales_contracts_value !== undefined
          ? total_sales_contracts_value
          : analytics.total_sales_contracts_value,
      total_spent_on_orders:
        total_spent_on_orders !== undefined
          ? total_spent_on_orders
          : analytics.total_spent_on_orders,
      total_revenue:
        total_revenue !== undefined ? total_revenue : analytics.total_revenue,
      total_contract_value_of_all_contracts:
        total_contract_value_of_all_contracts !== undefined
          ? total_contract_value_of_all_contracts
          : analytics.total_contract_value_of_all_contracts,
      total_contract_value_of_all_contracts_except_sales:
        total_contract_value_of_all_contracts_except_sales !== undefined
          ? total_contract_value_of_all_contracts_except_sales
          : analytics.total_contract_value_of_all_contracts_except_sales,
      updated_at: new Date(),
    });

    res.json(analytics);
  } catch (error) {
    console.error("Error updating analytics record:", error);
    res.status(500).json({
      error: "An error occurred while updating the analytics record.",
    });
  }
};

// Delete an Analytics record by report_date
exports.deleteAnalytics = catchAsync(async (req, res, next) => {
  const { report_date } = req.params;

  const analytics = await Analytics.findOne({ where: { report_date } });

  if (!analytics) {
    return next(
      new AppError("Analytics record not found for the specified date.", 404)
    );
  }

  await analytics.destroy();
  res.status(204).json({
    status: "success",
    message: "Analytics record deleted successfully.",
  });
});

// Generate analytics for a given month
exports.generateAnalyticsForMonth = catchAsync(async (req, res, next) => {
  let { month } = req.body;

  // Default month to current month if not provided
  if (!month) {
    const now = new Date();
    month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return next(new AppError('Invalid month format. Expected "YYYY-MM".', 400));
  }

  // Check if analytics for the month already exist
  const existingAnalytics = await Analytics.findOne({ where: { report_date: month } });
  if (existingAnalytics) {
    return res.status(200).json({
      status: "success",
      message: `Analytics for ${month} already exist.`,
      data: { analytics: existingAnalytics },
    });
  }

  // Define start and end dates for the month
  const [year, monthNumber] = month.split("-").map(Number);
  const startDate = new Date(year, monthNumber - 1, 1);
  const endDate = new Date(year, monthNumber, 0, 23, 59, 59, 999);

  // Other analytics calculations remain as before:
  const totalSalesContractsRevenue =
    (await SalesContract.sum("total_paid", {
      where: { createdAt: { [Op.between]: [startDate, endDate] } },
    })) || 0.0;

  const totalSalesContractsAmountToBePaid =
    (await SalesContract.sum("due_payment", {
      where: { created_at: { [Op.between]: [startDate, endDate] } },
    })) || 0.0;

  const totalSpentOnOrders =
    (await Order.sum("price", {
      where: { created_at: { [Op.between]: [startDate, endDate] } },
    })) || 0.0;

  const total_contract_value_of_all_contracts_except_sales =
    (await Document.sum("modified_contract_value", {
      where: { created_at: { [Op.between]: [startDate, endDate] } },
    })) || 0.0;

  const totalSalesContractsValue = totalSalesContractsRevenue;
  const total_contract_value_of_all_contracts =
    parseFloat(total_contract_value_of_all_contracts_except_sales) +
    parseFloat(totalSalesContractsValue);

  const totalRevenue =
    parseFloat(total_contract_value_of_all_contracts) -
    parseFloat(totalSpentOnOrders);

  // Now count only the orders and signatures for the month
  const totalOrders = await Order.count({
    where: { created_at: { [Op.between]: [startDate, endDate] } },
  });

  const totalSignatures = await Signature.count({
    where: {
      signed_at: { [Op.between]: [startDate, endDate] },
      signature_data: { [Op.not]: null },
    },
  });

  // Count tickets for the month
  const totalTicketsThisMonth = await Ticket.count({
    where: {
      created_at: {
        [Op.between]: [startDate, endDate]
      }
    }
  });

  console.log(`Monthly counts for ${month}: Orders: ${totalOrders}, Signatures: ${totalSignatures}, Tickets: ${totalTicketsThisMonth}`);

  // Create the analytics record with values for this month
  const analytics = await Analytics.create({
    report_date: month,
    total_sales_contracts_revenue: totalSalesContractsRevenue,
    total_sales_contracts_amount_to_be_paid: totalSalesContractsAmountToBePaid,
    total_sales_contracts_value: totalSalesContractsValue,
    total_spent_on_orders: totalSpentOnOrders,
    total_revenue: totalRevenue,
    total_contract_value_of_all_contracts,
    total_contract_value_of_all_contracts_except_sales,
    total_orders: totalOrders,
    total_signatures: totalSignatures,
    total_tickets: totalTicketsThisMonth,
    created_at: new Date(),
    updated_at: new Date(),
  });

  res.status(201).json({
    status: "success",
    message: `Analytics for ${month} generated successfully.`,
    data: { analytics },
  });
});