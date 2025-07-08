# 🔄 Система откатов MapMon v0.5

## Система безопасных откатов

### Текущее состояние
- **Backup ветка**: `backup-before-optimizations`
- **Последний commit**: `223fcbe` (с анализом проекта)
- **Дата создания**: 2025-01-08

### Команды для отката

#### Быстрый откат к исходному состоянию:
```bash
# Откат всех изменений к последнему коммиту
git reset --hard HEAD

# Откат к backup ветке
git checkout backup-before-optimizations

# Возврат на master с сохранением backup
git checkout master
git reset --hard backup-before-optimizations
```

#### Откат конкретного файла:
```bash
# Откат одного файла
git checkout HEAD -- path/to/file.js

# Откат из backup ветки
git checkout backup-before-optimizations -- path/to/file.js
```

#### Проверка различий:
```bash
# Сравнение с backup
git diff backup-before-optimizations

# Сравнение конкретного файла
git diff backup-before-optimizations -- path/to/file.js
```

### Протокол безопасных изменений

1. **Перед каждым изменением**:
   - Создать commit с текущим состоянием
   - Протестировать изменения
   - Документировать что изменено

2. **При ошибке**:
   - Выполнить `git reset --hard HEAD`
   - Проанализировать проблему
   - Попробовать альтернативный подход

3. **После успешного изменения**:
   - Создать новый commit
   - Обновить документацию
   - Отметить в CLAUDE.md успешное решение

### Рабочие решения (будут обновляться)

#### Успешные подходы:
- **Подключение**: SSH работает лучше чем токены
- **Команды сервера**: `npm run dev:full` для разработки
- **Развертывание**: PM2 с отдельными процессами

#### Неудачные подходы:
- **PM2 cluster mode**: Несовместим с Nuxt
- **WebSocket MQTT**: Конфликт с TCP ESP32
- **Единый сервер**: Лучше разделить на процессы

### Автоматические бэкапы

Перед каждой критической операцией будет создаваться новая backup ветка с именем:
- `backup-before-[операция]-[дата]`

### Команды для Claude

```bash
# Создать новый backup
git branch backup-before-[название]-$(date +%Y%m%d-%H%M)

# Быстрый откат
git reset --hard HEAD

# Проверка состояния
git status
git log --oneline -5
```