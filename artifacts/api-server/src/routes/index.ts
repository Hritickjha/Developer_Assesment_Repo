import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import meRouter from "./me.js";
import clientsRouter from "./clients.js";
import graphRouter from "./graph.js";
import onboardingRouter from "./onboarding.js";
import syncRouter from "./sync.js";
import auditRouter from "./audit.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(clientsRouter);
router.use(graphRouter);
router.use(onboardingRouter);
router.use(syncRouter);
router.use(auditRouter);

export default router;
