"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const prisma = new client_1.PrismaClient();
const getDbErrorResponse = (error) => {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P1001') {
            return {
                status: 503,
                message: 'Database is unreachable. Please check your DATABASE_URL connection.',
            };
        }
        if (error.code === 'P2021') {
            return {
                status: 500,
                message: 'Task table does not exist yet. Run Prisma migration first.',
            };
        }
    }
    return {
        status: 500,
        message: 'Internal server error',
    };
};
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // In a real app, hash this password with bcrypt
                isApproved: false, // Default to unapproved
            },
        });
        res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, name: newUser.name, email: newUser.email, isApproved: newUser.isApproved, isAdmin: newUser.isAdmin } });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isApproved: user.isApproved,
                isAdmin: user.isAdmin,
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get users endpoint (could be for the dashboard or admin)
app.get('/api/users', async (req, res) => {
    try {
        const approvedQuery = req.query.approved;
        const approvedFilter = approvedQuery === 'true' ? true : approvedQuery === 'false' ? false : undefined;
        const users = await prisma.user.findMany({
            where: approvedFilter === undefined ? undefined : { isApproved: approvedFilter },
            select: {
                id: true,
                name: true,
                email: true,
                isApproved: true,
                isAdmin: true,
                createdAt: true,
            }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.patch('/api/users/:id/approval', async (req, res) => {
    const { id } = req.params;
    const { isApproved } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isApproved },
        });
        res.json({ message: 'User approval updated', user });
    }
    catch (error) {
        console.error('Error updating user:', error);
        const dbError = getDbErrorResponse(error);
        res.status(dbError.status).json({ error: dbError.message });
    }
});
app.post('/api/tasks', async (req, res) => {
    const { timestamp, userId, companyName, task, carName, transportType, location, } = req.body;
    const allowedTransportTypes = ['own car', 'company car', 'going with other'];
    if (!timestamp || !userId || !companyName || !task || !carName || !transportType || !location) {
        return res.status(400).json({ error: 'All task fields are required' });
    }
    if (!allowedTransportTypes.includes(transportType)) {
        return res.status(400).json({ error: 'Invalid transport type' });
    }
    let parsedLocation;
    try {
        parsedLocation = new URL(location);
    }
    catch {
        return res.status(400).json({ error: 'Location must be a valid URL' });
    }
    const parsedTimestamp = new Date(timestamp);
    if (Number.isNaN(parsedTimestamp.getTime())) {
        return res.status(400).json({ error: 'Timestamp must be a valid date/time' });
    }
    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { id: true },
        });
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const createdRows = await prisma.$queryRaw `
      INSERT INTO "task" ("timestamp", "userId", "companyName", "task", "carName", "transportType", "location")
      VALUES (
        ${parsedTimestamp},
        ${Number(userId)},
        ${companyName.trim()},
        ${task.trim()},
        ${carName.trim()},
        ${transportType},
        ${parsedLocation.toString()}
      )
      RETURNING *
    `;
        return res.status(201).json({ message: 'Task created', task: createdRows[0] ?? null });
    }
    catch (error) {
        console.error('Error creating task:', error);
        const dbError = getDbErrorResponse(error);
        return res.status(dbError.status).json({ error: dbError.message });
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
