import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { getCustomer, getCustomerInfo, pay } from "./services/contract";
import { ethers } from "ethers";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
});

async function paymentCycle() {
  try {
    logger.info("Executing the payment cycle...");
    const customers = await getCustomer();
    for (const customer of customers) {
      if (customer === ethers.ZeroAddress) continue;
      const customerInfo = await getCustomerInfo(customer);
      if (customerInfo.nextPayment <= Date.now() / 1000) {
        await pay(customer);
        logger.info(`Payment processed for customer: ${customer}`);
      }
    }
    logger.info("Finished the payment cycle...");
  } catch (err) {
    logger.error("Error in payment cycle:", err);
  }
}

paymentCycle();
setInterval(paymentCycle, 60 * 60 * 1000);

const PORT = Number.parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});