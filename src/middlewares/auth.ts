import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function authMiddleware(ctx: Context, next: Next) {
    const token = ctx.headers.authorization?.split(' ')[1];
    if (!token) {
        ctx.status = 401;
        ctx.body = { message: 'Unauthorized' };
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        ctx.state.user = decoded;
        await next();
    } catch (error) {
        ctx.status = 401;
        ctx.body = { message: 'Invalid token' };
    }
}