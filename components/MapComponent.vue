<template>
  <div class="map-container h-full w-full relative">
    <!-- Карта -->
    <div 
      ref="mapContainer" 
      class="map-element h-full w-full"
      :class="{ 'opacity-0': !mapLoaded }"
    />
    
    <!-- Индикатор загрузки -->
    <div 
      v-if="!mapLoaded" 
      class="absolute inset-0 flex items-center justify-center bg-gray-900"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-300">Загрузка карты...</p>
      </div>
    </div>

    <!-- Элементы управления картой -->
    <div class="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <!-- Кнопка центрирования -->
      <button
        @click="centerOnEquipment"
        class="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors"
        title="Центрировать на технике"
      >
        <Icon name="heroicons:map-pin" class="w-5 h-5" />
      </button>
      
      <!-- Переключатель слоев -->
      <button
        @click="toggleMapStyle"
        class="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors"
        :title="`Текущий: ${mapStyles[currentStyle]?.name}. Нажмите для переключения`"
      >
        <Icon name="heroicons:photo" class="w-5 h-5" />
      </button>
      
      <!-- Индикатор стиля карты -->
      <div class="bg-gray-800 bg-opacity-90 text-white px-2 py-1 rounded text-xs text-center">
        {{ currentStyleIndex + 1 }}/{{ Object.keys(mapStyles).length }}
      </div>
    </div>

    <!-- Информация о карте -->
    <div class="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 text-white px-3 py-2 rounded-lg text-sm z-10">
      <div class="flex items-center gap-2">
        <Icon name="heroicons:signal" class="w-4 h-4 text-green-400" />
        <span>{{ mapStyles[currentStyle]?.name || 'Карта загружена' }}</span>
        <span class="text-gray-400">|</span>
        <span>Техника: {{ equipmentCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Реактивные переменные
const mapContainer = ref<HTMLElement>()
const mapLoaded = ref(false)
const equipmentCount = ref(0)

// Переменные карты
let map: maplibregl.Map | null = null
let currentStyle = ref('satellite') // Начинаем со спутниковых снимков
let currentStyleIndex = ref(1) // Индекс текущего стиля

// Стили карт
const mapStyles = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  },
  satellite: {
    name: 'Спутник ESRI',
    url: 'https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:Imagery?type=style'
  },
  hybrid: {
    name: 'Гибрид ESRI',
    url: 'https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:Imagery:Hybrid?type=style'
  },
  terrain: {
    name: 'Рельеф',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
  },
  dark: {
    name: 'Темная тема',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  }
}

// Убраны демо данные - используем только реальные данные из props

// Инициализация карты
const initializeMap = async () => {
  if (!mapContainer.value) return

  try {
    // Создание карты
    map = new maplibregl.Map({
      container: mapContainer.value,
      style: mapStyles.satellite.url, // Начинаем со спутниковых снимков
      center: [37.6176, 55.7558], // Москва
      zoom: 12,
      pitch: 0,
      bearing: 0
    })

    // Обработчики событий карты
    map.on('load', () => {
      mapLoaded.value = true
      addEquipmentMarkers()
      console.log('🗺️ Карта MapLibre GL JS загружена успешно')
    })

    map.on('error', (e) => {
      console.error('❌ Ошибка загрузки карты:', e)
    })

    // Добавление элементов управления
    map.addControl(new maplibregl.NavigationControl(), 'top-left')
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left')

  } catch (error) {
    console.error('❌ Ошибка инициализации карты:', error)
  }
}

// Добавление маркеров техники
const addEquipmentMarkers = () => {
  if (!map || !props.vehicles) return

  props.vehicles.forEach(equipment => {
    // Создание HTML элемента для маркера
    const markerElement = document.createElement('div')
    markerElement.className = 'equipment-marker'
    markerElement.innerHTML = `
      <div class="marker-content bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"/>
        </svg>
      </div>
    `

    // Создание маркера
    const marker = new maplibregl.Marker(markerElement)
      .setLngLat([equipment.lng, equipment.lat])
      .addTo(map)

    // Создание popup с информацией
    const popup = new maplibregl.Popup({ offset: 25 })
      .setHTML(`
        <div class="p-3">
          <h3 class="font-bold text-gray-900 mb-2">${equipment.name}</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Статус:</span>
              <span class="font-medium ${equipment.status === 'active' ? 'text-green-600' : 'text-gray-600'}">
                ${equipment.status === 'active' ? 'Активен' : 'Простой'}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Скорость:</span>
              <span class="font-medium">${equipment.speed} км/ч</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Направление:</span>
              <span class="font-medium">${equipment.heading}°</span>
            </div>
          </div>
        </div>
      `)

    marker.setPopup(popup)
  })

  equipmentCount.value = props.vehicles?.length || 0
}

// Центрирование на технике
const centerOnEquipment = () => {
  if (!map || !props.vehicles || props.vehicles.length === 0) return

  // Вычисление границ для всей техники
  const bounds = new maplibregl.LngLatBounds()
  props.vehicles.forEach(equipment => {
    bounds.extend([equipment.lng, equipment.lat])
  })

  // Центрирование карты
  map.fitBounds(bounds, {
    padding: 50,
    maxZoom: 15
  })
}

// Переключение стиля карты
const toggleMapStyle = () => {
  if (!map) return

  // Получаем список всех доступных стилей
  const styleKeys = Object.keys(mapStyles)
  
  // Переходим к следующему стилю
  currentStyleIndex.value = (currentStyleIndex.value + 1) % styleKeys.length
  const newStyleKey = styleKeys[currentStyleIndex.value]
  currentStyle.value = newStyleKey
  
  const newStyle = mapStyles[newStyleKey as keyof typeof mapStyles]
  
  console.log(`🗺️ Переключение на: ${newStyle.name}`)
  
  map.setStyle(newStyle.url)
  
  // Переинициализация маркеров после смены стиля
  map.once('styledata', () => {
    addEquipmentMarkers()
  })
}

// Lifecycle hooks
onMounted(async () => {
  await nextTick()
  await initializeMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

// Экспорт для использования в родительском компоненте
defineExpose({
  centerOnEquipment,
  toggleMapStyle,
  map: () => map
})
</script>

<style scoped>
.map-container {
  font-family: 'Inter', sans-serif;
}

.map-element {
  border-radius: 0.5rem;
}

/* Стили для маркеров */
:deep(.equipment-marker) {
  cursor: pointer;
  transition: transform 0.2s ease;
}

:deep(.equipment-marker:hover) {
  transform: scale(1.1);
}

/* Стили для popup */
:deep(.maplibregl-popup-content) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: none;
  padding: 0;
}

:deep(.maplibregl-popup-tip) {
  border-top-color: white;
}

/* Анимация загрузки */
.opacity-0 {
  transition: opacity 0.3s ease;
}
</style> 