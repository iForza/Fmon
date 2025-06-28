# 🔧 ПЛАН РЕШЕНИЯ: Отсутствие схемы базы данных

## 🚨 ПРОБЛЕМА
**База данных SQLite используется без четкой схемы и миграций**

### Проблемы:
- Отсутствие файла schema.sql в основном проекте
- Неопределенная структура таблиц
- Нет миграционной системы

## 🎯 ЦЕЛЬ
Создать четкую схему БД с миграциями для стабильной работы API

## 📋 ПЛАН ДЕЙСТВИЙ

### Шаг 1: Создать основную схему
```sql
-- database/schema.sql
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(64),
  type VARCHAR(32),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telemetry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id VARCHAR(32),
  latitude REAL,
  longitude REAL,
  speed INTEGER,
  heading INTEGER,
  fuel INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES vehicles(device_id)
);
```

### Шаг 2: Система миграций
```javascript
// server/utils/migrations.js
export const runMigrations = async () => {
  const migrations = [
    '001-initial-schema.sql',
    '002-add-telemetry-table.sql'
  ];
  
  for (const migration of migrations) {
    await runMigration(migration);
  }
}
```

### Шаг 3: Инициализация БД при запуске
```javascript
// В server/api или server-backup/api-server.cjs
await runMigrations();
```

## 🧪 ТЕСТИРОВАНИЕ
- Создать тестовую БД
- Проверить все CRUD операции
- Тестировать миграции

## ✅ ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ
- Четкая структура БД
- Автоматические миграции
- Стабильная работа API 