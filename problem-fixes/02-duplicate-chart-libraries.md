# 🔧 ПЛАН РЕШЕНИЯ: Дублирование библиотек графиков

## 🚨 ПРОБЛЕМА
**В проекте установлены две библиотеки графиков - ApexCharts и ECharts, но используется только ECharts**

### Текущее состояние:
- `package.json`: ApexCharts 4.7.0 + ECharts 5.5.0
- `plugins/apexcharts.client.ts`: Неиспользуемый плагин
- `plugins/echarts.client.ts`: Активно используется
- `components/ChartComponent.vue`: Использует только ECharts
- Лишний размер bundle: ~500KB

## 🎯 ЦЕЛЬ
Удалить неиспользуемую библиотеку ApexCharts для уменьшения размера bundle и упрощения зависимостей

## 📋 ПЛАН ДЕЙСТВИЙ

### Шаг 1: Проверить использование ApexCharts
```bash
# Поиск импортов ApexCharts
grep -r "apexcharts" components/ pages/ composables/
grep -r "ApexCharts" components/ pages/ composables/
grep -r "vue3-apexcharts" components/ pages/ composables/
```

### Шаг 2: Удалить ApexCharts из package.json
```json
// УДАЛИТЬ из package.json:
{
  "dependencies": {
    // "apexcharts": "^4.7.0",
    // "vue3-apexcharts": "^1.6.3"
  }
}
```

### Шаг 3: Удалить неиспользуемый плагин
```bash
# Удалить файл
rm plugins/apexcharts.client.ts
```

### Шаг 4: Обновить nuxt.config.ts (если есть ссылки)
```typescript
// Проверить и удалить любые ссылки на ApexCharts плагин
export default defineNuxtConfig({
  plugins: [
    // Убедиться что нет ссылок на apexcharts.client.ts
  ]
})
```

### Шаг 5: Очистка node_modules
```bash
# Удалить node_modules и переустановить зависимости
rm -rf node_modules
rm yarn.lock  # или package-lock.json
yarn install  # или npm install
```

### Шаг 6: Проверить ChartComponent.vue
```vue
<!-- Убедиться что используется только ECharts -->
<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import * as echarts from 'echarts'
// НЕ должно быть импортов ApexCharts
</script>
```

## 🧪 ТЕСТИРОВАНИЕ

### Тест 1: Сборка проекта
```bash
yarn build
# Проверить что сборка проходит без ошибок
```

### Тест 2: Проверка графиков
1. Запустить `yarn dev`
2. Открыть страницу с графиками
3. Убедиться что графики отображаются корректно
4. Проверить что нет ошибок в консоли браузера

### Тест 3: Анализ размера bundle
```bash
# Сравнить размер bundle до и после удаления
yarn build --analyze
# Или проверить размер .nuxt/dist/
```

## 📊 АЛЬТЕРНАТИВНЫЕ ВАРИАНТЫ

### Вариант 1: Оставить ApexCharts для будущего использования
**НЕ РЕКОМЕНДУЕТСЯ** - увеличивает размер без пользы

### Вариант 2: Заменить ECharts на ApexCharts
**НЕ РЕКОМЕНДУЕТСЯ** - требует переписывания ChartComponent.vue

### Вариант 3: Использовать Chart.js
**НЕ РЕКОМЕНДУЕТСЯ** - еще одна зависимость без необходимости

## ⚠️ ВОЗМОЖНЫЕ ПРОБЛЕМЫ

1. **Скрытые зависимости**: Некоторые компоненты могут косвенно использовать ApexCharts
2. **TypeScript ошибки**: Могут остаться импорты типов
3. **Кэш браузера**: Старые файлы могут ссылаться на ApexCharts

## 🔍 ПРОВЕРОЧНЫЙ ЧЕКЛИСТ

- [ ] Поиск всех упоминаний ApexCharts в коде
- [ ] Удаление из package.json
- [ ] Удаление плагина apexcharts.client.ts
- [ ] Переустановка зависимостей
- [ ] Тестирование сборки
- [ ] Проверка работы графиков
- [ ] Анализ размера bundle

## 📈 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ

- ✅ Уменьшение размера bundle на ~500KB
- ✅ Упрощение зависимостей
- ✅ Ускорение установки зависимостей
- ✅ Меньше потенциальных конфликтов
- ✅ Чистый код без неиспользуемых импортов 