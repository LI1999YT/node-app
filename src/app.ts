import Koa from 'koa';
import bodyParser from 'koa-body';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = new Koa();

app.use(bodyParser());
app.use(cors());
app.use(helmet());

app.use(authRoutes.routes()).use(authRoutes.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});