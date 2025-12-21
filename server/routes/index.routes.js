import express from 'express';
import workspaceRoutes from './workspace.routes.js';
import { protect } from '../middlewares/authMiddleware.js';
import projectRouter from './project.routes.js';
import taskRouter from './task.routes.js';
import commentRouter from './comment.routes.js';

const app = express()
const routes = express.Router();

routes.use(`/workspace`, protect, workspaceRoutes);
routes.use(`/project`, protect, projectRouter);
routes.use(`/task`, protect, taskRouter);
routes.use(`/router`, protect, commentRouter);

export default routes;