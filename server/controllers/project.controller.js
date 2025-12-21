import prisma from "../config/prisma.js";

// Create Project
export const createProject = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { workspaceId, description, name, status, start_date, end_date, team_members, team_lead, progress, priority } = req.body;

        // Check if user has the admin role for the workspace
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            includes: { members: { includes: { user: true } } }
        })

        if (!workspace) {
            return res.status(404).json({ message: `Workspace not found !!` });
        }

        if (!workspace.members.some((member) => member.userId === userId && member.role === "ADMIN")) {
            return res.status(403).json({ message: `You don't have permission to create project in this workspace !!` });
        }

        // Get team lead using email
        const teamLead = await prisma.user.findUnique({
            where: { email: team_lead },
            select: { id: true }
        })

        const project = await prisma.project.create({
            data: {
                workspaceId,
                name,
                description,
                status,
                priority,
                progress,
                team_lead: teamLead?.id,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null
            }
        })

        // Add member to project if they are in the workspace
        if (team_members?.length > 0) {
            const memberToAdd = [];
            workspace.members.forEach(member => {
                if (team_members.includes(member.user.email)) {
                    memberToAdd.push(member.user.id);
                }
            })

            await prisma.projectMember.createMany({
                data: memberToAdd.map(memberId => ({
                    projectId: project.id,
                    userid: memberId
                }))
            })
        }

        const projectWithMembers = await prisma.project.findUnique({
            where: { id: project.id },
            include: {
                members: { include: { user: true } },
                tasks: { include: { assignee: true, comments: { include: { user: true } } } },
                owner: true
            }
        })

        return res.status(201).json({ project: projectWithMembers, message: "Project Created Successfully" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.code })
    }
}

// Update Project
export const updateProject = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id, workspaceId, description, name, status, start_date, end_date, progress, priority } = req.body;

        // Check if user has the admin role for workspace
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { members: { include: { user: true } } }
        })

        if (!workspace) {
            return res.status(404).json({ message: `Workspace not found !!` });
        }

        if (!workspace.members.some((member) => member.userId === userId && member.role === "ADMIN")) {
            const project = await prisma.project.findUnique({
                where: { id }
            })

            if (!project) {
                return res.status(404).json({ message: `Project not found !!` })
            } else if (project.team_lead !== userId) {
                return res.status(403).json({ message: `You don't have permission to update project in this workspace !!` });
            }
        }

        const project = await prisma.project.update({
            where: { id },
            data: {
                workspaceId,
                name,
                description,
                status,
                priority,
                progress,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null,
            }
        })

        return res.status(201).json({ project, message: `Project Updated Successfully !!` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.code })
    }
}

// Add member to Project
export const addMember = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { projectId } = req.params;
        const { email } = req.body;

        // Check if user is project lead;
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: { include: { user: true } } },
        })

        if (!project) {
            return res.status(404).json({ message: `Project is not found !!` });
        }

        if (project.team_lead !== userId) {
            return res.status(404).json({ message: `Only project lead can add members !!` });
        }

        // Check if user is already memeber
        const existingMember = project.members.find((member) => member.email === email)

        if (existingMember) {
            return res.status(404).json({ message: `User is already a member !!` });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: `User not found !!` });
        }

        const member = await prisma.projectMember.create({
            data: {
                userId: user?.id,
                projectId
            }
        })

        return res.status(201).json({ member, message: `Member added Successfully !!` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.code })
    }
}