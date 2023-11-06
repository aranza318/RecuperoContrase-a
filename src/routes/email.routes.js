import { Router } from "express";
import { sendEmail } from '../controllers/messages.controller.js';
import { passportCall } from "../midsIngreso/passAuth.js";
import { sendPasswordRecoveryEmail } from "../controllers/messages.controller.js";

const emailRouter = Router();

emailRouter.get("/", passportCall('jwt'), sendEmail);

emailRouter.post("/api/email/sendRestoreLink", sendPasswordRecoveryEmail);

export default emailRouter;

