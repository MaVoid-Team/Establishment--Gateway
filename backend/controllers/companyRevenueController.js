// controllers/companyRevenueController.js

const { CompanyRevenue, Company } = require("../models/assosciations");

// Get all Company Revenue Summaries
exports.getAllCompanyRevenueSummaries = async (req, res) => {
  try {
    const summaries = await CompanyRevenue.findAll({
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["id", "name"],
        },
      ],
      order: [["total_revenue_generated", "DESC"]],
    });
    res.json(summaries);
  } catch (error) {
    console.error("Error fetching company revenue summaries:", error);
    res.status(500).json({
      error: "An error occurred while fetching company revenue summaries.",
    });
  }
};

// Get a single Company Revenue Summary by Company ID
exports.getCompanyRevenueSummaryById = async (req, res) => {
  const { company_id } = req.params;
  try {
    const summary = await CompanyRevenue.findOne({
      where: { company_id },
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!summary) {
      return res
        .status(404)
        .json({ error: "Company revenue summary not found." });
    }

    res.json(summary);
  } catch (error) {
    console.error("Error fetching company revenue summary:", error);
    res.status(500).json({
      error: "An error occurred while fetching the company revenue summary.",
    });
  }
};
