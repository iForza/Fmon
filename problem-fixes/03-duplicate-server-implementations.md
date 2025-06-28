# 🔧 ПЛАН РЕШЕНИЯ: Дублирование серверных реализаций

## 🚨 ПРОБЛЕМА
**В проекте есть дублирование серверной логики между `server/index.ts` и `server-backup/api-server.cjs`**

### Текущее состояние:
- `server/index.ts`: Nuxt серверные API роуты (заглушки)
- `server-backup/api-server.cjs`: Реальный Fastify сервер с SQLite
- `server-backup/mqtt-collector.cjs`: MQTT коллектор
- Неопределенность какой сервер используется в продакшене

## 🎯 ЦЕЛЬ
Объединить серверную логику в единую архитектуру и устранить дублирование

## 🔍 АНАЛИЗ ТЕКУЩЕГО СОСТОЯНИЯ

### server/index.ts (Nuxt API):
```typescript
// Минимальные заглушки
export default defineEventHandler(() => {
  return { message: 'API endpoint' }
})
```

### server-backup/api-server.cjs (Fastify):
```javascript
// Полноценный сервер с:
- SQLite интеграцией
- CRUD операциями
- Настройками CORS
- Логированием
```

### ecosystem.config.cjs:
```javascript
// Запускает server-backup/api-server.cjs
// НЕ использует server/index.ts
```

## 📋 ПЛАН ДЕЙСТВИЙ

### Вариант 1: Переход на Nuxt API (РЕКОМЕНДУЕМЫЙ)

#### Шаг 1: Перенести логику из api-server.cjs в Nuxt API
```typescript
// server/api/vehicles/index.get.ts
export default defineEventHandler(async (event) => {
  const db = await import('~/server/utils/database')
  return await db.getVehicles()
})

// server/api/vehicles/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await import('~/server/utils/database')
  return await db.createVehicle(body)
})
```

#### Шаг 2: Создать утилиты для работы с базой
```typescript
// server/utils/database.ts
import Database from 'better-sqlite3'

const db = new Database('./data/mapmon.db')

export const getVehicles = () => {
  return db.prepare('SELECT * FROM vehicles').all()
}

export const createVehicle = (data: any) => {
  return db.prepare('INSERT INTO vehicles (name, type) VALUES (?, ?)').run(data.name, data.type)
}
```

#### Шаг 3: Обновить ecosystem.config.cjs
```javascript
module.exports = {
  apps: [
    {
      name: 'mapmon-nuxt',
      script: '.output/server/index.mjs',
      env: {
        NUXT_PORT: 3000,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'mqtt-collector',
      script: './server-backup/mqtt-collector.cjs'
    }
  ]
}
```

### Вариант 2: Полный переход на Fastify

#### Шаг 1: Переместить api-server.cjs в server/
```bash
mv server-backup/api-server.cjs server/api-server.cjs
mv server-backup/SQLiteManager.cjs server/SQLiteManager.cjs
```

#### Шаг 2: Удалить Nuxt серверные роуты
```bash
rm -rf server/api/
```

#### Шаг 3: Обновить nuxt.config.ts
```typescript
export default defineNuxtConfig({
  nitro: {
    // Отключить встроенный сервер для API
    experimental: {
      wasm: true
    }
  },
  // Проксировать API запросы к Fastify
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001'
    }
  }
})
```

## 🧪 ТЕСТИРОВАНИЕ

### Тест 1: API эндпоинты
```bash
# Тестировать все API роуты
curl http://localhost:3000/api/vehicles
curl -X POST http://localhost:3000/api/vehicles -d '{"name":"test","type":"car"}'
```

### Тест 2: Frontend интеграция
1. Проверить работу useApi.ts
2. Убедиться что все компоненты работают
3. Проверить админ панель

### Тест 3: Сборка и развертывание
```bash
yarn build
pm2 start ecosystem.config.cjs
```

## ⚠️ ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### Проблема 1: Совместимость базы данных
```typescript
// Решение: Создать миграционный скрипт
// server/utils/migrate.ts
export const migrate = async () => {
  // Проверить схему БД и обновить при необходимости
}
```

### Проблема 2: CORS настройки
```typescript
// В Nuxt API роутах добавить CORS headers
export default defineEventHandler(async (event) => {
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
  return data
})
```

### Проблема 3: WebSocket интеграция
```typescript
// Использовать Nuxt WebSocket support
// server/api/websocket.ts
export default defineWebSocketHandler({
  message(peer, message) {
    // Обработка WebSocket сообщений
  }
})
```

## 📊 СРАВНЕНИЕ ВАРИАНТОВ

| Критерий | Nuxt API | Fastify |
|----------|----------|---------|
| Простота | ✅ Встроенная | ❌ Дополнительный сервер |
| Производительность | ⚡ Хорошая | ⚡⚡ Отличная |
| WebSocket | ✅ Встроенная | ❌ Требует настройки |
| Масштабируемость | ⚡ Средняя | ⚡⚡ Высокая |
| Миграция | ✅ Легкая | ❌ Сложная |

## 🎯 РЕКОМЕНДАЦИЯ: Вариант 1 (Nuxt API)

**Причины:**
1. ✅ Единая кодовая база
2. ✅ Упрощение развертывания
3. ✅ Встроенная поддержка TypeScript
4. ✅ Меньше конфигурации
5. ✅ Проще отладка

## 📋 ЧЕКЛИСТ ВЫПОЛНЕНИЯ

- [ ] Создать server/utils/database.ts
- [ ] Перенести все API роуты в server/api/
- [ ] Обновить ecosystem.config.cjs
- [ ] Протестировать все эндпоинты
- [ ] Обновить useApi.ts если необходимо
- [ ] Удалить server-backup/api-server.cjs
- [ ] Проверить работу на VPS 