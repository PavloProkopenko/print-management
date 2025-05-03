import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/user.routes';
import printerRouter from './routes/printer.routes';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 8080;

// Створюємо директорію для завантажених файлів
const uploadsDir = path.join(process.cwd(), 'src', 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}

// Додаємо логування для відстеження запитів
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Files:', req.files);
  next();
});

// Налаштування CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Парсинг JSON та URL-encoded даних
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Обслуговування статичних файлів
app.use('/uploads', express.static(uploadsDir));

// Роути
app.use('/api', userRouter);
app.use('/api', printerRouter);

// Тестовий роут
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Socket.IO підключення
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Запуск сервера
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Експортуємо io для використання в інших файлах
export { io };