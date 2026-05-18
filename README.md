> **Проект находится в активной разработке. Функциональность может меняться без предупреждения. Продакшн-использование не рекомендуется.**
>
> **This project is under active development. Functionality may change without notice. Production use is not recommended.**

---

# VinChecker

**RU** | [EN](#vinchecker-en)

---

## Описание

VinChecker — инструмент для автоматического сбора информации об автомобиле по VIN-номеру. Пользователь вводит VIN, после чего бот обходит открытые источники и возвращает все найденные данные в виде JSON.

## Стек

- **Backend:** Python, FastAPI
- **Frontend:** React, TypeScript

## Источники

| Источник | Статус      | Данные                               |
| -------- | ----------- | ------------------------------------ |
| ka.by    | ✅ Работает | Марка, страна ввоза, дата растаможки |

## Формат ответа

```json
{
  "vin": "SADCA2BNXJA327536",
  "sources_success": ["ka.by"],
  "sources_failed": [],
  "data": {
    "ka.by": {
      "brand": "JAGUAR",
      "country": "Беларусь",
      "customs_date": "2022/11/17",
      "source_url": "https://ka.by/vin/SADCA2BNXJA327536"
    }
  }
}
```

## Запуск локально

**Бэкенд**

```bash
cd backend
pip install -r requirements.txt
pip install requests beautifulsoup4
uvicorn main:app --reload
```

Сервер запустится на `http://127.0.0.1:8000`.

**Фронтенд**

```bash
cd frontend
npm install
npm run dev
```

Приложение запустится на `http://localhost:5173`.

**Проверка**

```bash
curl http://127.0.0.1:8000/check/SADCA2BNXJA327536
```

---

<a name="vinchecker-en"></a>

# VinChecker

[RU](#vinchecker) | **EN**

---

## Description

VinChecker is a tool for automatically gathering vehicle information by VIN. The user submits a VIN, the bot crawls open sources, and returns all found data as JSON.

## Stack

- **Backend:** Python, FastAPI
- **Frontend:** React, TypeScript

## Sources

| Source | Status    | Data                                |
| ------ | --------- | ----------------------------------- |
| ka.by  | ✅ Active | Brand, import country, customs date |

## Response Format

```json
{
  "vin": "SADCA2BNXJA327536",
  "sources_success": ["ka.by"],
  "sources_failed": [],
  "data": {
    "ka.by": {
      "brand": "JAGUAR",
      "country": "Беларусь",
      "customs_date": "2022/11/17",
      "source_url": "https://ka.by/vin/SADCA2BNXJA327536"
    }
  }
}
```

## Running Locally

**Backend**

```bash
cd backend
pip install -r requirements.txt
pip install requests beautifulsoup4
uvicorn main:app --reload
```

Server runs at `http://127.0.0.1:8000`.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

**Test**

```bash
curl http://127.0.0.1:8000/check/SADCA2BNXJA327536
```
