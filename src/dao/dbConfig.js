import mongoose from "mongoose";
import { MONGODB_CNX_STR } from "../config/configs.js";
import Logger from "../config/logger.js";

const log = new Logger();
const URI = MONGODB_CNX_STR

try {
    await mongoose.connect(URI,({
        useNewUrlParser: true,
        useUnifiedTopology: true
      }))
    log.logger.info("Conectado a MongoDB");
} catch (error) {
    log.logger.error(error);
}