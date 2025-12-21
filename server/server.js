import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { functions, inngest } from './inngest/index.js';
import routes from './routes/index.routes.js';

const app = express();
const PORT = process.env.PORT || 5000
app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

app.get('/', (req, res) => {
    return res.json({
        success: true, status: 201, message: `Hello Developer !!`
    })
})

app.use('/api/inngest', serve({ client: inngest, functions }))
app.use(`/api`, routes)

app.listen(PORT, () => {
    console.log(`Server running on PORT : ${PORT}`);
})