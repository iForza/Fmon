<template>
  <UModal v-model="isOpen" :ui="{ width: 'w-full max-w-2xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">
            <UIcon name="i-heroicons-cog-6-tooth" class="mr-2" />
            Настройки MQTT
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="closeModal"
          />
        </div>
      </template>

      <div class="space-y-6">
        <!-- Статус подключения -->
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-md font-medium text-white">Статус подключения</h4>
            <div class="flex items-center space-x-2">
              <div 
                :class="[
                  'w-3 h-3 rounded-full',
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                ]"
              />
              <span class="text-sm text-gray-300">
                {{ getStatusText() }}
              </span>
            </div>
          </div>
          
          <div class="text-sm text-gray-400">
            <div>Последнее сообщение: {{ lastMessageTime || 'Нет данных' }}</div>
            <div>Активных устройств: {{ activeDevices }}</div>
          </div>
        </div>

        <!-- Настройки MQTT -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-white">Параметры подключения</h4>
          
          <!-- URL сервера -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">URL MQTT брокера</label>
            <UInput 
              v-model="settings.url" 
              placeholder="ws://test.mosquitto.org:8080/mqtt"
              class="bg-gray-700"
            />
            <div class="text-xs text-gray-500 mt-1">
              Используйте ws:// для WebSocket соединения
            </div>
          </div>

          <!-- Порт -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Порт</label>
            <UInput 
              v-model="settings.port" 
              type="number"
              placeholder="8080"
              class="bg-gray-700"
            />
          </div>

          <!-- Имя пользователя -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Имя пользователя</label>
            <UInput 
              v-model="settings.username" 
              placeholder="(не требуется)"
              class="bg-gray-700"
            />
          </div>

          <!-- Пароль -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Пароль</label>
            <UInput 
              v-model="settings.password" 
              type="password"
              placeholder="••••••••"
              class="bg-gray-700"
            />
          </div>

          <!-- Client ID -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Client ID</label>
            <UInput 
              v-model="settings.clientId" 
              placeholder="mapmon-client"
              class="bg-gray-700"
            />
            <div class="text-xs text-gray-500 mt-1">
              Уникальный идентификатор клиента
            </div>
          </div>

          <!-- Топики -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Топики подписки</label>
            <UTextarea 
              v-model="topicsText" 
              :rows="3"
              placeholder="car&#10;vehicles/+/telemetry&#10;vehicles/+/status"
              class="bg-gray-700"
            />
            <div class="text-xs text-gray-500 mt-1">
              Каждый топик на новой строке
            </div>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
          <UButton 
            @click="testConnection" 
            :loading="testing"
            color="blue"
            variant="outline"
            class="flex-1"
          >
            <UIcon name="i-heroicons-signal" class="mr-2" />
            Тест подключения
          </UButton>
          
          <UButton 
            @click="saveSettings" 
            :loading="saving"
            color="green"
            class="flex-1"
          >
            <UIcon name="i-heroicons-check" class="mr-2" />
            Сохранить настройки
          </UButton>
          
          <UButton 
            @click="resetToDefaults" 
            color="gray"
            variant="outline"
            class="flex-1"
          >
            <UIcon name="i-heroicons-arrow-path" class="mr-2" />
            Сброс
          </UButton>
        </div>

        <!-- Результат тестирования -->
        <div v-if="testResult" class="mt-4">
          <div 
            :class="[
              'rounded-lg p-3 text-sm',
              testResult.success 
                ? 'bg-green-800/20 border border-green-500 text-green-300'
                : 'bg-red-800/20 border border-red-500 text-red-300'
            ]"
          >
            <div class="flex items-center space-x-2">
              <UIcon 
                :name="testResult.success ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" 
                class="w-4 h-4" 
              />
              <span class="font-medium">
                {{ testResult.success ? 'Подключение успешно!' : 'Ошибка подключения' }}
              </span>
            </div>
            <div class="mt-1 text-xs opacity-80">
              {{ testResult.message }}
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMqttClient } from '~/composables/useMqttClient'

// Пропсы
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Эмиты
const emit = defineEmits(['update:modelValue'])

// MQTT клиент (единый для всего проекта)
const mqtt = useMqttClient()

// Локальное состояние
const testing = ref(false)
const saving = ref(false)
const testResult = ref(null)

// Настройки MQTT (реальные значения из WQTT брокера)
const settings = ref({
  url: 'm9.wqtt.ru',
  port: '20264',
  username: 'u_MZEPA5',
  password: 'L3YAUTS6',
  clientId: 'mapmon-web-' + Date.now(),
  topics: [
    'mapmon/vehicles/+/data/telemetry',
    'mapmon/vehicles/+/data/gps',
    'mapmon/vehicles/+/data/sensors',
    'mapmon/vehicles/+/status/connection',
    'mapmon/vehicles/+/status/health',
    'car',
    'vehicles/+/telemetry',
    'vehicles/+/status',
    'vehicles/+/heartbeat'
  ]
})

// Текстовое представление топиков
const topicsText = computed({
  get: () => settings.value.topics.join('\n'),
  set: (value) => {
    settings.value.topics = value.split('\n').filter(t => t.trim().length > 0)
  }
})

// Вычисляемые свойства
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const connectionStatus = computed(() => {
  if (mqtt.isConnecting.value) return 'connecting'
  if (mqtt.isConnected.value) return 'connected'
  if (mqtt.error.value) return 'error'
  return 'disconnected'
})

const lastMessageTime = computed(() => {
  if (mqtt.lastActivity.value) {
    return mqtt.lastActivity.value.toLocaleTimeString('ru-RU')
  }
  return 'Нет данных'
})

const activeDevices = computed(() => mqtt.connectedDevices.value.length)

// Методы
const closeModal = () => {
  isOpen.value = false
  testResult.value = null
}

const getStatusText = () => {
  switch (connectionStatus.value) {
    case 'connected': return 'Подключен'
    case 'connecting': return 'Подключение...'
    case 'disconnected': return 'Отключен'
    case 'error': return 'Ошибка'
    default: return 'Неизвестно'
  }
}

const testConnection = async () => {
  testing.value = true
  testResult.value = null
  
  try {
    // Тестируем реальное MQTT подключение к WQTT.RU
    if (mqtt.isConnected.value) {
      testResult.value = {
        success: true,
        message: `Уже подключен к WQTT.RU! Устройств: ${mqtt.connectedDevices.value.length}, Сообщений: ${mqtt.statistics.value.totalMessages}`
      }
    } else {
      // Пытаемся подключиться
      await mqtt.connect({
        host: settings.value.url,
        port: parseInt(settings.value.port),
        username: settings.value.username,
        password: settings.value.password,
        clientId: settings.value.clientId,
        topics: settings.value.topics,
        useWebSocket: process.client
      })
      
      // Ждем установки соединения (до 10 секунд)
      let attempts = 0
      while (!mqtt.isConnected.value && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 500))
        attempts++
        
        if (mqtt.error.value) {
          throw new Error(mqtt.error.value)
        }
      }
      
      if (mqtt.isConnected.value) {
        testResult.value = {
          success: true,
          message: 'Успешное подключение к WQTT.RU брокеру!'
        }
      } else {
        testResult.value = {
          success: false,
          message: 'Таймаут подключения к MQTT брокеру'
        }
      }
    }
  } catch (error) {
    testResult.value = {
      success: false,
      message: error.message || 'Ошибка подключения к MQTT'
    }
  } finally {
    testing.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  
  try {
    // Применяем новые настройки к MQTT клиенту
    await mqtt.updateSettings({
      host: settings.value.url,
      port: parseInt(settings.value.port),
      username: settings.value.username,
      password: settings.value.password,
      clientId: settings.value.clientId,
      topics: settings.value.topics,
      useWebSocket: process.client
    })
    
    testResult.value = {
      success: true,
      message: 'Настройки WQTT.RU сохранены и применены!'
    }
    
    // Закрываем модальное окно через 2 секунды
    setTimeout(() => {
      closeModal()
    }, 2000)
    
  } catch (error) {
    testResult.value = {
      success: false,
      message: error.message || 'Ошибка применения настроек MQTT'
    }
  } finally {
    saving.value = false
  }
}

const resetToDefaults = () => {
  // Сбрасываем к реальным WQTT.RU настройкам
  settings.value = {
    url: 'm9.wqtt.ru',
    port: '20264',
    username: 'u_MZEPA5',
    password: 'L3YAUTS6',
    clientId: 'mapmon-web-' + Date.now(),
    topics: [
      'mapmon/vehicles/+/data/telemetry',
      'mapmon/vehicles/+/data/gps',
      'mapmon/vehicles/+/data/sensors',
      'mapmon/vehicles/+/status/connection',
      'mapmon/vehicles/+/status/health',
      'car',
      'vehicles/+/telemetry',
      'vehicles/+/status',
      'vehicles/+/heartbeat'
    ]
  }
  testResult.value = null
}

// Загружаем настройки MQTT при открытии
watch(isOpen, (newValue) => {
  if (newValue) {
    // Загружаем текущие настройки из MQTT клиента
    if (mqtt.settings.value) {
      settings.value = {
        url: mqtt.settings.value.host,
        port: mqtt.settings.value.port.toString(),
        username: mqtt.settings.value.username,
        password: mqtt.settings.value.password,
        clientId: mqtt.settings.value.clientId,
        topics: [...mqtt.settings.value.topics]
      }
    }
    testResult.value = null
  }
})

// Инициализация MQTT при монтировании
onMounted(() => {
  // Автоматически подключаемся к WQTT.RU при загрузке
  if (!mqtt.isConnected.value && !mqtt.isConnecting.value) {
    mqtt.connect()
  }
})
</script> 