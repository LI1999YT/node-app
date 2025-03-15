import Router from 'koa-router';
import { register, login } from '../services/userService';

const router = new Router({ prefix: '/auth' });

router.post('/register', async (ctx) => {
    const { username, password } = ctx.request.body;
    try {
        const user = await register(username, password);
        ctx.body = { message: 'User registered', user };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { message: error.message };
    }
});

router.post('/login', async (ctx) => {
    const { username, password } = ctx.request.body;
    try {
        const result = await login(username, password);
        ctx.body = result;
    } catch (error: any) {
        ctx.status = 401;
        ctx.body = { message: error.message };
    }
});

export default router;