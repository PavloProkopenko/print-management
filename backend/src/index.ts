import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/user.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Додаємо логування для відстеження запитів
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Налаштування CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ]
}));

// Парсинг JSON
app.use(express.json());

// Роути
app.use('/api', router);

// Тестовий роут
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});