import express from 'express';
import { addMember, getUserWorkspaces } from '../controllers/workspace.controller.js';

const workspaceRoutes = express.Router();

workspaceRoutes.get(`/`, getUserWorkspaces);
workspaceRoutes.post(`/add-member`, addMember);

export default workspaceRoutes;