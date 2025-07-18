# Claude Code Rules and Guidelines

## Language and Communication
- **Primary Language**: Always explain and communicate in Russian (Русский язык)
- **Documentation**: Technical documentation can be in English for better understanding by Claude

## Development Approach
- **Think as Senior Developer**: Always approach problems with senior-level thinking
- **Analyze Before Action**: Before editing or creating any file, study the relevance and compatibility of functions using MCP Context7
- **Verify Existing Implementation**: Before adding new features, thoroughly check if functionality already exists but may not be properly implemented or displayed

## Solution Memory and Prioritization
- **Remember Working Solutions**: When multiple solutions exist for a problem, prioritize the one that has proven successful
- **Connection Preferences**: 
  - If token-based connection fails but SSH works, remember and prioritize SSH
  - Document successful connection methods for future reference
- **Server Commands**: Remember which server update and startup commands work best based on successful runs
- **Deployment Methods**: Track which deployment approaches are most reliable

## Code Quality and Safety
- **No Unsolicited Features**: Never add new features that might complicate the project without explicit user approval
- **Pre-Implementation Analysis**: Before implementing or editing functions, analyze potential errors in existing functionality
- **Avoid Duplication**: Always check if requested functionality already exists before creating new implementations
- **Function Integration**: Verify that existing functions are properly integrated and not just implemented but unused

## Project Analysis Protocol
1. **Study Current State**: Thoroughly analyze project structure and existing implementations
2. **Use Context7**: Verify function relevance and best practices using MCP Context7
3. **Document Findings**: Create detailed reports of discovered issues and solutions
4. **Prioritize Fixes**: Focus on fixes that provide significant optimization and bug elimination

## Agricultural Vehicle Monitoring Project Context
- **Main Purpose**: Monitor agricultural equipment using ESP32 modules
- **Data Flow**: ESP32 → MQTT → VPS Server → Frontend Dashboard
- **Current ESP32 Role**: Single unit simulating multiple vehicles for debugging
- **Server Components**: MQTT data processing, storage, web frontend
- **Frontend Features**: Equipment monitoring, connection settings management

## Error Detection and Reporting
- **Systematic Review**: Analyze all components for potential issues
- **Optimization Focus**: Identify fixes that significantly improve performance
- **Bug Elimination**: Prioritize critical bug fixes over feature additions
- **Documentation**: Create comprehensive error reports with prioritized solutions

## ВАЖНЫЕ ПРАВИЛА БЕЗОПАСНОСТИ И РЕЗЕРВНОГО КОПИРОВАНИЯ

### Правила работы с безопасностью:
- **НЕ ЗАНИМАТЬСЯ БЕЗОПАСНОСТЬЮ** проекта без явного запроса пользователя
- **НЕ УДАЛЯТЬ файлы с паролями/credentials** - пользователь сам изменит их перед продакшн
- **НЕ ВНЕДРЯТЬ** меры безопасности самостоятельно
- **Безопасность = только по запросу** пользователя

### Правила резервного копирования:
- **ВСЕГДА ДЕЛАТЬ BACKUP** перед удалением файлов
- **Создавать папку** `/archive/backup-ГГГГ-ММ-ДД/` для каждого backup
- **Сохранять все удаляемые файлы** в backup папку
- **Информировать пользователя** о создании backup

### Восстановленные файлы после ошибки:
- `esp32/fleet_tracker.ino` - восстановлен из git истории (коммит 223fcbe)
- `esp32/consol.txt` - создан заново (логи отладки)

## Working Solutions Memory
*This section will be updated as successful solutions are discovered*

### Connection Methods
- SSH работает лучше токенов для git операций
- HTTP API polling работает стабильнее WebSocket MQTT
- ✅ **РЕШЕНО**: GitHub интеграция работает (2025-01-08)
  - git push origin master успешно загружает изменения
  - Репозиторий: https://github.com/iForza/Fmon.git
  - Claude Code умеет работать с git командами

### Server Commands
- `npm run dev` - успешный запуск frontend разработки
- `npm run dev:full` - concurrent frontend + API для полной разработки

### Frontend Memory Management
- ✅ **РЕШЕНО**: Утечки памяти в polling исправлены (2025-01-08)
  - Добавлены переменные для отслеживания интервалов
  - Реализованы функции stopPolling() и cleanup() 
  - Все компоненты теперь правильно очищают ресурсы в onUnmounted

### Deployment Procedures
- PM2 с отдельными процессами работает лучше cluster mode
- Backup ветки перед критическими изменениями обязательны
- ✅ **РЕШЕНО**: VPS обновление через GitHub (2025-01-08)
  - git pull origin master для получения изменений на VPS
  - Создан VPS_UPDATE_INSTRUCTIONS_v2.md с полными инструкциями
  - Процедура: backup → git pull → npm ci → npm run build → pm2 restart

### VPS Диагностика (2025-01-08)
- ✅ **УСПЕШНО**: Диагностические команды VPS выполнены
  - uname -a, free -h, df -h - системная информация
  - find команды - нашли проект в /var/www/mapmon/
  - pm2 status - все процессы online 3+ дня стабильно
  - netstat -tulpn - порты 3000,3001 работают
  - curl localhost:3001/api/status - API отвечает корректно
  - Сервер Ubuntu 22.04.5 LTS, Node.js v20.19.2, PM2 v6.0.8

### VPS Package Manager
- ✅ **ВАЖНО**: На VPS используется YARN, а НЕ npm
  - Используй `yarn install` вместо `npm ci`
  - Проект имеет yarn.lock файл
  - npm run build работает для сборки

### VPS Обновление успешно завершено (2025-01-08)
- ✅ **РЕШЕНО**: Git настроен и работает в /var/www/mapmon/
- ✅ **РЕШЕНО**: SSR ошибки в pages/history.vue исправлены (лишняя скобка)
- ✅ **РЕШЕНО**: VPS сервер обновлен с исправлениями утечек памяти
- ✅ **РЕШЕНО**: PM2 процессы перезапущены с новым кодом
- ✅ **РЕШЕНО**: Сборка npm run build проходит успешно
- ⚠️ База данных местоположение нужно уточнить
- ⚠️ MQTT timeout ошибки (не критично для отладки)

### VPS Команды которые работают:
- `cd /var/www/mapmon` - переход в проект
- `yarn install` - установка зависимостей (НЕ npm ci!)
- `npm run build` - сборка проекта
- `git pull origin master` - получение обновлений
- `pm2 start ecosystem.config.cjs` - запуск сервисов
- `sed -i 'номер_строкиd' файл` - удаление строки для исправления