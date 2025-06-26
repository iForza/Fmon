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
import { useMqttSettings } from '~/composables/useMqttSettings'

// Пропсы
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Эмиты
const emit = defineEmits(['update:modelValue'])

// Composable для настроек MQTT
const mqttSettings = useMqttSettings()

// Локальное состояние
const testing = ref(false)
const saving = ref(false)
const testResult = ref(null)

  // Настройки (локальная копия для редактирования)
  const settings = ref({
    url: 'ws://test.mosquitto.org:8080/mqtt',
    port: '8080',
    username: '',
    password: '',
    clientId: 'mapmon-client',
    topics: ['car', 'vehicles/+/telemetry', 'vehicles/+/status']
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

const connectionStatus = computed(() => mqttSettings.connectionStatus.value)
const lastMessageTime = computed(() => mqttSettings.lastMessageTime.value)
const activeDevices = computed(() => mqttSettings.activeDevices.value)

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
    const result = await mqttSettings.testConnection(settings.value)
    testResult.value = result
  } catch (error) {
    testResult.value = {
      success: false,
      message: error.message || 'Неизвестная ошибка'
    }
  } finally {
    testing.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  
  try {
    await mqttSettings.saveSettings(settings.value)
    
    // Показываем успешное сохранение
    testResult.value = {
      success: true,
      message: 'Настройки сохранены успешно!'
    }
    
    // Закрываем модальное окно через 2 секунды
    setTimeout(() => {
      closeModal()
    }, 2000)
    
  } catch (error) {
    testResult.value = {
      success: false,
      message: error.message || 'Ошибка сохранения настроек'
    }
  } finally {
    saving.value = false
  }
}

const resetToDefaults = () => {
  settings.value = {
    url: 'ws://test.mosquitto.org:8080/mqtt',
    port: '8080',
    username: '',
    password: '',
    clientId: 'mapmon-client-' + Date.now(),
    topics: ['car', 'vehicles/+/telemetry', 'vehicles/+/status']
  }
  testResult.value = null
}

// Загружаем сохраненные настройки при открытии
watch(isOpen, (newValue) => {
  if (newValue) {
    const saved = mqttSettings.loadSettings()
    if (saved) {
      settings.value = { ...saved }
    }
    testResult.value = null
  }
})

// Инициализация
onMounted(() => {
  mqttSettings.initialize()
})
</script> 