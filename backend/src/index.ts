import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/user.routes';
import printerRouter from './routes/printer.routes';

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
app.use('/api/auth', userRouter);
app.use('/api/printers', printerRouter);

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