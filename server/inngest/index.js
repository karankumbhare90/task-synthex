import { Inngest } from 'inngest'
import prisma from '../config/prisma.js';

export const inngest = new Inngest({ id: "TaskSynthex" })

// Inngest function to create user
const syncUserCreation = inngest.createFunction(
    { id: `sync-user-from-clerk` },
    { event: "clerk/user.created" },
    async ({ event }) => {
        const { data } = event;
        await prisma.user.create({
            data: {
                id: data?.id,
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url
            }
        })
    }
)

// Inngest function to update user
const syncUserUpdation = inngest.createFunction(
    { id: `update-user-from-clerk` },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        const { data } = event;
        await prisma.user.create({
            where: {
                id: data?.id
            },
            data: {
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url
            }
        })
    }
)

// Inngest function to delete user from DB
const syncUserDeletion = inngest.createFunction(
    { id: `delete-user-from-clerk` },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        const { data } = event;
        await prisma.user.delete({
            where: {
                id: data?.id,
            }
        })
    }
)

export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion
];