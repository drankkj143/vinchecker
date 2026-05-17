import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Настраиваем CORS, чтобы фронтенд (например, с localhost:5173) мог общаться с бэкэндом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене лучше указать конкретный URL фронтенда
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/vin/{vin}")
async def websocket_endpoint(websocket: WebSocket, vin: str):
    # Принимаем подключение от фронтенда
    await websocket.accept()
    print(f"Бот запущен для VIN: {vin}")

    try:
        # --- Шаг 1: Имитация начала работы ---
        await websocket.send_json(
            {
                "type": "log",
                "message": f"Инициализация парсера. Проверка VIN {vin}...",
                "status": "pending",
            }
        )
        await asyncio.sleep(2)  # Ждем 2 секунды (имитируем загрузку браузера)

        # --- Шаг 2: Имитация обхода первого сайта ---
        await websocket.send_json(
            {
                "type": "log",
                "message": "Подключение к базе данных ГИБДД... Успешно.",
                "status": "success",
            }
        )
        await asyncio.sleep(1.5)

        # --- Шаг 3: Имитация обхода второго сайта ---
        await websocket.send_json(
            {
                "type": "log",
                "message": "Поиск истории регистраций и пробега...",
                "status": "pending",
            }
        )
        await asyncio.sleep(2)

        # --- Шаг 4: Имитация успешного завершения сбора данных ---
        await websocket.send_json(
            {
                "type": "log",
                "message": "Данные успешно собраны из 3 источников!",
                "status": "success",
            }
        )
        await asyncio.sleep(1)

        # --- Шаг 5: Отправка финального результата ---
        # В будущем здесь вместо фейковых данных будет результат работы Playwright/Selenium
        mock_car_data = {
            "brand": "BMW",
            "model": "X5",
            "year": 2021,
            "mileage": "65 000 км",
        }

        await websocket.send_json({"type": "result", "payload": mock_car_data})

    except WebSocketDisconnect:
        # Если пользователь закрыл вкладку или отменил поиск, сервер не упадет
        print(f"Пользователь отключился во время парсинга VIN: {vin}")


# Простой корневой роут для проверки работоспособности через браузер
@app.get("/")
def read_root():
    return {"status": "FastAPI работает. WebSocket доступен по адресу /ws/vin/{vin}"}
