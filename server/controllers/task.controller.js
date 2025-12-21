import prisma from "../config/prisma.js";

// Create a Task
export const createTask = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { projectId, title, description, type, status, priority, assigneeId, due_date } = req.body;

        const origin = req.get('origin');

        // Check if user has admin role for project
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: { include: { user: true } } }
        })

        if (!project) {
            return res.status(404).json({ message: `Project not found !!` });
        } else if (project.team_lead !== userId) {
            return res.status(403).json({ message: `You don't have admin privilegas for this project !!` });
        } else if (assigneeId && !project.members.find((member) => member.user.id === assigneeId)) {
            return res.status(403).json({ message: `Assignee is not a member of the project / workspace !!` })
        }

        const task = await prisma.task.create({
            data: {
                projectId,
                title,
                description,
                priority,
                assigneeId,
                status,
                due_date: new Date(due_date)
            }
        })

        const taskWithAssignee = await prisma.task.findUnique({
            where: { id: task.id },
            include: { assignee: true }
        })

        return res.status(201).json({ task: taskWithAssignee, message: `Task created successfully !!` })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.code })
    }
}

// Update a Task
export const updateTask = async (req, res) => {
    try {
        const task = await prisma.task.findUnique({
            where: { id: req.params.id }
        })

        if (!task) {
            return res.status(404).json({ message: `Task not found !!` });
        }
        const { userId } = await req.auth();

        // Check if user has admin role for project
        const project = await prisma.project.findUnique({
            where: { id: task?.projectId },
            include: { members: { include: { user: true } } }
        })

        if (!project) {
            return res.status(404).json({ message: `Project not found !!` });
        } else if (project.team_lead !== userId) {
            return res.status(403).json({ message: `You don't have admin privilegas for this project !!` });
        }

        const updateTask = await prisma.task.update({
            where: { id: req.params.id },
            data: req.body,
        })

        return res.status(201).json({ task: updateTask, message: `Task updated successfully !!` })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.code })
    }
}

// Delete a Task
export const deleteTask = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { tasksIds } = await req.body;
        const tasks = await prisma.task?.findMany({
            where: { id: { in: tasksIds } },
        })

        if (tasks.length === 0) {
            return res.status(404).json({ message: `Task not found !!` })
        }

        // Check if user has admin role for project
        const project = await prisma.project.findUnique({
            where: { id: tasks[0]?.projectId },
            include: { members: { include: { user: true } } }
        })

        if (!project) {
            return res.status(404).json({ message: `Project not found !!` });
        } else if (project.team_lead !== userId) {
            return res.status(403).json({ message: `You don't have admin privilegas for this project !!` });
        }

        await prisma.task.deleteMany({
            where: { id: { in: tasksIds } }
        })

        return res.status(201).json({ message: `Task deleted successfully !!` })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.code })
    }
}