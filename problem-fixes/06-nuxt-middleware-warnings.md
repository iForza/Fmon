# 🔧 ПЛАН РЕШЕНИЯ: Предупреждения Nuxt middleware

## 🚨 ПРОБЛЕМА
**Постоянные предупреждения: 'manifest-route-rule' middleware already exists**

### Текущие ошибки:
```
[17:36:01] WARN 'manifest-route-rule' middleware already exists at 
'C:/Users/user/Desktop/MapMon0.5v/node_modules/nuxt/dist/app/middleware/manifest-route-rule.js'. 
You can set override: true to replace it.
```

## 🎯 ЦЕЛЬ
Устранить предупреждения middleware и оптимизировать конфигурацию Nuxt

## 📋 ПЛАН ДЕЙСТВИЙ

### Шаг 1: Анализ причины проблемы
- Проверить nuxt.config.ts на дублирующие настройки
- Найти конфликтующие middleware

### Шаг 2: Обновить nuxt.config.ts
```typescript
export default defineNuxtConfig({
  experimental: {
    // Отключить экспериментальные функции вызывающие конфликты
    appManifest: false
  },
  nitro: {
    experimental: {
      wasm: true
    }
  }
})
```

### Шаг 3: Очистить .nuxt кэш
```bash
rm -rf .nuxt
yarn dev
```

## 🧪 ТЕСТИРОВАНИЕ
- Запустить `yarn dev` без предупреждений
- Проверить HMR работает корректно

## ✅ ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ
- Отсутствие предупреждений middleware
- Стабильная работа HMR 