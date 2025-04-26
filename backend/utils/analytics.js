const catchAsync = require("./catchAsync");

exports.updateRevenue = async ({
  model,
  idField,
  idValue,
  modifiedContractValue, //contract price
  oldModifiedContractValue,
  contract, // for other document
  transaction,
}) => {
  const existingRevenue = await model.findOne({
    where: { [idField]: idValue },
    transaction,
  });

  if (existingRevenue) {
    //remove the old contract price
    existingRevenue.total_other_contracts_price = oldModifiedContractValue
      ? parseFloat(existingRevenue.total_other_contracts_price) -
        parseFloat(oldModifiedContractValue || 0)
      : parseFloat(existingRevenue.total_other_contracts_price);

    //add the new contract price
    existingRevenue.total_other_contracts_price = modifiedContractValue
      ? parseFloat(existingRevenue.total_other_contracts_price) +
        parseFloat(modifiedContractValue || 0)
      : parseFloat(existingRevenue.total_other_contracts_price);

    //add or remove other contract number
    existingRevenue.total_number_of_other_contracts = contract
      ? existingRevenue.total_number_of_other_contracts + contract
      : existingRevenue.total_number_of_other_contracts;

    existingRevenue.updated_at = new Date();
    await existingRevenue.save({ transaction });
  } else {
    await model.create(
      {
        [idField]: idValue,
        total_other_contracts_price: parseFloat(modifiedContractValue),
        total_number_of_other_contracts: contract,
        updated_at: new Date(),
      },
      { transaction }
    );
  }
};

exports.updateSalesRevenue = async ({
  model,
  idField,
  idValue,
  totalPaid,
  totalRemaining,
  OldTotalPaid,
  OldTotalRemaining,
  modifiedContractValue, //contract price
  oldModifiedContractValue,
  salesContract,
  transaction,
}) => {
  const existingRevenue = await model.findOne({
    where: { [idField]: idValue },
    transaction,
  });

  if (existingRevenue) {
    //remove the old contract price
    existingRevenue.total_sales_contracts_price = oldModifiedContractValue
      ? parseFloat(existingRevenue.total_sales_contracts_price) -
        parseFloat(oldModifiedContractValue || 0)
      : parseFloat(existingRevenue.total_sales_contracts_price);

    //add the new contract price
    existingRevenue.total_sales_contracts_price = modifiedContractValue
      ? parseFloat(existingRevenue.total_sales_contracts_price) +
        parseFloat(modifiedContractValue || 0)
      : parseFloat(existingRevenue.total_sales_contracts_price);

    //add or remove other contract number
    existingRevenue.total_number_of_sales_contracts = salesContract
      ? existingRevenue.total_number_of_sales_contracts + salesContract
      : existingRevenue.total_number_of_sales_contracts;

    //remove old total paid
    existingRevenue.total_revenue_generated = OldTotalPaid
      ? parseFloat(existingRevenue.total_revenue_generated) -
        parseFloat(OldTotalPaid)
      : parseFloat(existingRevenue.total_revenue_generated);

    //add the new total paid
    existingRevenue.total_revenue_generated = totalPaid
      ? parseFloat(existingRevenue.total_revenue_generated) +
        parseFloat(totalPaid)
      : parseFloat(existingRevenue.total_revenue_generated);

    //remove old remaining
    existingRevenue.total_revenue_to_be_generated = OldTotalRemaining
      ? parseFloat(existingRevenue.total_revenue_to_be_generated) -
        parseFloat(OldTotalRemaining)
      : parseFloat(existingRevenue.total_revenue_to_be_generated);

    //add the new remaining
    existingRevenue.total_revenue_to_be_generated = totalRemaining
      ? parseFloat(existingRevenue.total_revenue_to_be_generated) +
        parseFloat(totalRemaining)
      : parseFloat(existingRevenue.total_revenue_to_be_generated);

    existingRevenue.updated_at = new Date();
    await existingRevenue.save({ transaction });
  } else {
    await model.create(
      {
        [idField]: idValue,
        total_sales_contracts_price: parseFloat(modifiedContractValue),
        total_number_of_sales_contracts: salesContract,
        total_revenue_to_be_generated: totalRemaining,
        total_revenue_generated: totalPaid,
        updated_at: new Date(),
      },
      { transaction }
    );
  }
};
