// controllers/vendorRevenueController.js

const { VendorRevenue, Vendor } = require("../models/assosciations");

// Get all Vendor Revenue Summaries
exports.getAllVendorRevenueSummaries = async (req, res) => {
  try {
    const summaries = await VendorRevenue.findAll({
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["id", "name"],
        },
      ],
      order: [["total_revenue_generated", "DESC"]],
    });
    res.json(summaries);
  } catch (error) {
    console.error("Error fetching vendor revenue summaries:", error);
    res.status(500).json({
      error: "An error occurred while fetching vendor revenue summaries.",
    });
  }
};

// Get a single Vendor Revenue Summary by Vendor ID
exports.getVendorRevenueById = async (req, res) => {
  const { vendor_id } = req.params;
  try {
    const summary = await VendorRevenue.findOne({
      where: { vendor_id },
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!summary) {
      return res
        .status(404)
        .json({ error: "Vendor revenue summary not found." });
    }

    res.json(summary);
  } catch (error) {
    console.error("Error fetching vendor revenue summary:", error);
    res.status(500).json({
      error: "An error occurred while fetching the vendor revenue summary.",
    });
  }
};
