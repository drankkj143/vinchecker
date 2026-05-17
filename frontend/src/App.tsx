import React, { useState, useEffect, useRef } from 'react';

// Описываем типы для логов бота и итогового результата

interface CarData {
  brand: string;
  model: string;
  year: number;
  mileage: string;
}

function App() {
  const [vin, setVin] = useState<string>('');
  const [result, setResult] = useState<CarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Храним сокет в ref, чтобы он не пересоздавался при каждом рендере
  const ws = useRef<WebSocket | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vin.trim()) return;

    // Сбрасываем интерфейс перед новым поиском
    setResult(null);
    setIsLoading(true);

    // Логируем в консоль браузера запуск процесса
    console.log(`%c[Фронтенд] Отправлен запрос на парсинг VIN: ${vin.toUpperCase()}`, 'color: #3b82f6; font-weight: bold;');

    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/vin/${vin.toUpperCase()}`);

    // Слушаем сообщения от бэкэнда
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'log') {
        // Выводим шаги бота в консоль с цветовой кодировкой в зависимости от статуса
        const statusColor = data.status === 'success' ? '#10b981' : data.status === 'error' ? '#f43f5e' : '#f59e0b';
        console.log(`%c[Бот-Логгер]: ${data.message}`, `color: ${statusColor}; font-family: monospace;`);

      } else if (data.type === 'result') {
        setResult(data.payload);
        setIsLoading(false);
        ws.current?.close(); // Закрываем соединение

        // Вывод финального объекта в консоль в виде удобной таблицы
        console.log('%c[Результат]: Данные успешно получены!', 'color: #10b981; font-weight: bold;');
        console.table(data.payload);
      }
    };
  };

  // Чистим соединение при размонтировании компонента
  useEffect(() => {
    return () => ws.current?.close();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Проверка авто по VIN</h1>
      
      {/* Форма ввода */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          placeholder="Введите VIN (17 символов)"
          maxLength={17}
          disabled={isLoading}
          style={{ flex: 1, padding: '10px', fontSize: '16px', textTransform: 'uppercase' }}
        />
        <button type="submit" disabled={isLoading || !vin} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          {isLoading ? 'Бот ищет данные...' : 'Запустить бота'}
        </button>
      </form>

      {/* Блок с результатом */}
      {result && (
        <div style={{ border: '2px solid #4caf50', padding: '20px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ color: '#4caf50', marginTop: 0 }}>Отчет сформирован!</h3>
          <p><strong>Марка:</strong> {result.brand}</p>
          <p><strong>Модель:</strong> {result.model}</p>
          <p><strong>Год выпуска:</strong> {result.year}</p>
          <p><strong>Пробег:</strong> {result.mileage}</p>
        </div>
      )}
    </div>
  );
}

export default App;
