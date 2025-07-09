<template>
  <div class="h-full flex flex-col">
    <!-- Панель управления картой -->
    <div class="p-4 bg-gray-800 border-b border-gray-700">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-white">Карта техники</h2>
        
        <div class="flex items-center space-x-3">
          <!-- Переключатель типа карты -->
          <USelectMenu
            v-model="mapStyle"
            :options="mapStyles"
            option-attribute="label"
            value-attribute="value"
            class="w-40"
          />
          
          <!-- Кнопка центрирования -->
          <UButton
            icon="i-heroicons-map-pin"
            variant="outline"
            color="gray"
            @click="centerMap"
          >
            Центрировать
          </UButton>
          
          <!-- Кнопка обновления -->
          <UButton
            icon="i-heroicons-arrow-path"
            variant="outline"
            color="gray"
            @click="refreshData"
            :loading="isRefreshing"
          >
            Обновить
          </UButton>
        </div>
      </div>
    </div>

    <!-- Контейнер карты -->
    <div class="flex-1 relative">
      <MapComponent 
        ref="mapComponent" 
        :vehicles="props.vehicles"
        :selectedVehicleId="props.selectedVehicleId"
        @vehicleSelected="onVehicleSelected"
        @vehicleDeselected="onVehicleDeselected"
      />
      
      <!-- Индикатор загрузки -->
      <div 
        v-if="isMapLoading" 
        class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10"
      >
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="text-4xl text-blue-500 animate-spin mb-2" />
          <p class="text-white">Загрузка карты...</p>
        </div>
      </div>

      <!-- Панель информации о выбранной технике -->
      <div 
        v-if="selectedVehicle"
        class="absolute top-4 right-4 w-80 bg-gray-800 border border-gray-700 rounded-lg p-4 z-20"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-white">{{ selectedVehicle.name }}</h3>
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            color="gray"
            size="sm"
            @click="emit('vehicle-selected', null)"
          />
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Скорость:</span>
            <span class="text-white">{{ selectedVehicle.speed }} км/ч</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Координаты:</span>
            <span class="text-white">{{ selectedVehicle.lat.toFixed(4) }}, {{ selectedVehicle.lng.toFixed(4) }}</span>
          </div>
          
          <!-- Дополнительная информация для MQTT техники -->
          <div v-if="selectedVehicle.battery" class="flex justify-between">
            <span class="text-gray-400">Батарея:</span>
            <span class="text-white">{{ selectedVehicle.battery.toFixed(1) }}%</span>
          </div>
          <div v-if="selectedVehicle.temperature" class="flex justify-between">
            <span class="text-gray-400">Температура:</span>
            <span class="text-white">{{ selectedVehicle.temperature.toFixed(1) }}°C</span>
          </div>
          <div v-if="selectedVehicle.rpm" class="flex justify-between">
            <span class="text-gray-400">RPM:</span>
            <span class="text-white">{{ selectedVehicle.rpm }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-400">Последнее обновление:</span>
            <span class="text-white">{{ formatTime(selectedVehicle.lastUpdate) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Статус:</span>
            <span 
              :class="[
                'px-2 py-1 rounded text-xs',
                selectedVehicle.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              ]"
            >
              {{ selectedVehicle.status === 'active' ? 'Активна' : 'Остановлена' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Список техники на карте -->
      <div class="absolute bottom-4 left-4 space-y-2">
        <div
          v-for="vehicle in props.vehicles"
          :key="vehicle.id"
          @click="selectVehicle(vehicle.id)"
          :class="[
            'bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors',
            props.selectedVehicleId === vehicle.id ? 'ring-2 ring-blue-500' : ''
          ]"
        >
          <div class="flex items-center space-x-3">
            <div
              :class="[
                'w-3 h-3 rounded-full',
                vehicle.status === 'active' ? 'bg-green-500' : 'bg-red-500'
              ]"
            />
            <div>
              <div class="text-white font-medium text-sm">{{ vehicle.name }}</div>
              <div class="text-gray-400 text-xs">{{ vehicle.speed }} км/ч</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Пропсы от родительского компонента
const props = defineProps({
  vehicles: {
    type: Array,
    default: () => []
  },
  selectedVehicleId: {
    type: String,
    default: null
  }
})

// Эмиты для взаимодействия с родительским компонентом
const emit = defineEmits(['vehicle-selected'])

// Состояние карты
const isMapLoading = ref(false)
const isRefreshing = ref(false)
const mapComponent = ref(null)

// Настройки карты
const mapStyle = ref('streets')
const mapStyles = [
  { label: 'Улицы', value: 'streets' },
  { label: 'Спутник', value: 'satellite' },
  { label: 'Гибрид', value: 'hybrid' },
  { label: 'Местность', value: 'terrain' }
]

// Вычисляемые свойства
const selectedVehicle = computed(() => {
  if (!props.selectedVehicleId) return null
  return props.vehicles.find(v => v.id === props.selectedVehicleId)
})

// Функции
const selectVehicle = (vehicle) => {
  emit('vehicle-selected', vehicle)
}

// Обработчики событий от компонента карты
const onVehicleSelected = (vehicleId) => {
  emit('vehicle-selected', vehicleId)
  console.log('Выбрана техника на карте:', vehicleId)
}

const onVehicleDeselected = () => {
  emit('vehicle-selected', null)
  console.log('Техника снята с выделения')
}

const centerMap = () => {
  console.log('Центрирование карты')
  if (mapComponent.value) {
    mapComponent.value.centerOnEquipment()
  }
}

const refreshData = async () => {
  isRefreshing.value = true
  
  // Имитация обновления данных
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  console.log('Данные обновлены')
  
  isRefreshing.value = false
}

// Используем новый composable для работы с временем
const { formatTime, getRelativeTime, getConnectionStatus } = useTime()

// Жизненный цикл компонента
onMounted(() => {
  console.log('Компонент карты загружен')
  // TODO: Инициализация карты будет добавлена позже
})
</script>

<style scoped>
/* Стили для компонента карты */
#map {
  min-height: 400px;
}
</style> 