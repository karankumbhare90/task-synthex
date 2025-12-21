import prisma from "../config/prisma.js";

// Add Comment
export const addComment = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { content, taskId } = req.body;

        // Check if user is projectMember
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        })

        const project = await prisma.project.findUnique({
            where: { id: task.projectId },
            include: { members: { include: { user: true } } }
        })

        if (!project) {
            return res.status(404).json({ message: `Project not found !!` })
        }

        const member = project.members.find((member) => member.userId === userId);

        if (!member) {
            return res.status(403).json({ message: `You're not member of this project !!` })
        }

        const comment = await prisma.comment.create({
            data: { taskId, content, userId },
            include: { user: true }
        })

        return res.status(201).json({ comment, message: `Comment added Successfully !!` })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.code })
    }
}

// Get Comment for task 
export const getTaskComments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const comments = await prisma.comment.findMany({
            where: { taskId },
            include: { user: true }
        })

        return res.status(201).json({ comments })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.code })
    }
}