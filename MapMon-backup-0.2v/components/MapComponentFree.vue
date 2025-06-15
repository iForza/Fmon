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
        <p class="text-gray-300">Загрузка спутниковых снимков...</p>
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
        <span>{{ mapStyles[currentStyle]?.name || 'Спутниковая карта' }}</span>
        <span class="text-gray-400">|</span>
        <span>Техника: {{ equipmentCount }}</span>
      </div>
    </div>

    <!-- Панель выбора стиля -->
    <div 
      v-if="showStylePanel"
      class="absolute top-4 left-4 bg-gray-800 bg-opacity-95 text-white p-4 rounded-lg shadow-lg z-20 max-w-xs"
    >
      <h3 class="text-sm font-semibold mb-3">Стили карты</h3>
      <div class="space-y-2">
        <button
          v-for="(style, key) in mapStyles"
          :key="key"
          @click="setMapStyle(key)"
          :class="[
            'w-full text-left px-3 py-2 rounded text-sm transition-colors',
            currentStyle === key 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <Icon 
              :name="getStyleIcon(key)" 
              class="w-4 h-4" 
            />
            <span>{{ style.name }}</span>
          </div>
          <div class="text-xs text-gray-400 mt-1">{{ style.description }}</div>
        </button>
      </div>
      <button
        @click="showStylePanel = false"
        class="mt-3 w-full px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
      >
        Закрыть
      </button>
    </div>

    <!-- Кнопка открытия панели стилей -->
    <button
      v-if="!showStylePanel"
      @click="showStylePanel = true"
      class="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors z-10"
      title="Выбрать стиль карты"
    >
      <Icon name="heroicons:cog-6-tooth" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Реактивные переменные
const mapContainer = ref<HTMLElement>()
const mapLoaded = ref(false)
const equipmentCount = ref(0)
const showStylePanel = ref(false)

// Переменные карты
let map: maplibregl.Map | null = null
let currentStyle = ref('satellite') // Начинаем со спутниковых снимков
let currentStyleIndex = ref(0) // Индекс текущего стиля

// Бесплатные стили карт (без API ключей)
const mapStyles = {
  satellite: {
    name: 'Спутник (Bing)',
    description: 'Спутниковые снимки высокого разрешения',
    url: {
      version: 8,
      sources: {
        'bing-satellite': {
          type: 'raster',
          tiles: [
            'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1',
            'https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1',
            'https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1',
            'https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1'
          ],
          tileSize: 256,
          attribution: '© Microsoft Bing Maps'
        }
      },
      layers: [
        {
          id: 'bing-satellite',
          type: 'raster',
          source: 'bing-satellite'
        }
      ]
    }
  },
  hybrid: {
    name: 'Гибрид (Google)',
    description: 'Спутниковые снимки с подписями',
    url: {
      version: 8,
      sources: {
        'google-satellite': {
          type: 'raster',
          tiles: [
            'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
            'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
            'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
            'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
          ],
          tileSize: 256,
          attribution: '© Google Maps'
        }
      },
      layers: [
        {
          id: 'google-satellite',
          type: 'raster',
          source: 'google-satellite'
        }
      ]
    }
  },
  terrain: {
    name: 'Рельеф (OpenTopo)',
    description: 'Топографическая карта с рельефом',
    url: {
      version: 8,
      sources: {
        'opentopo': {
          type: 'raster',
          tiles: [
            'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
            'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
            'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenTopoMap (CC-BY-SA)'
        }
      },
      layers: [
        {
          id: 'opentopo',
          type: 'raster',
          source: 'opentopo'
        }
      ]
    }
  },
  osm: {
    name: 'OpenStreetMap',
    description: 'Стандартная карта с дорогами',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  },
  dark: {
    name: 'Темная тема',
    description: 'Темная карта для ночного режима',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  }
}

// Пропсы для получения данных техники
interface Vehicle {
  id: string
  name: string
  lat: number
  lng: number
  status: string
  speed: number
  lastUpdate?: Date
}

interface Props {
  vehicles?: Vehicle[]
  selectedVehicleId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  vehicles: () => [],
  selectedVehicleId: null
})

// Эмиты для взаимодействия с родительским компонентом
const emit = defineEmits<{
  vehicleSelected: [vehicleId: string]
  vehicleDeselected: []
}>()

// Получение иконки для стиля
const getStyleIcon = (styleKey: string) => {
  const icons = {
    satellite: 'heroicons:globe-alt',
    hybrid: 'heroicons:map',
    terrain: 'heroicons:mountain',
    osm: 'heroicons:map-pin',
    dark: 'heroicons:moon'
  }
  return icons[styleKey as keyof typeof icons] || 'heroicons:map'
}

// Инициализация карты
const initializeMap = async () => {
  if (!mapContainer.value) return

  try {
    // Создание карты
    const initialStyle = mapStyles.satellite
    map = new maplibregl.Map({
      container: mapContainer.value,
      style: typeof initialStyle.url === 'string' ? initialStyle.url : initialStyle.url,
      center: [37.6176, 55.7558], // Москва
      zoom: 12,
      pitch: 0,
      bearing: 0
    })

    // Обработчики событий карты
    map.on('load', () => {
      mapLoaded.value = true
      addEquipmentMarkers()
      console.log('🛰️ Спутниковая карта загружена успешно')
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

// Хранилище маркеров для управления
const markers = ref<Map<string, maplibregl.Marker>>(new Map())

// Добавление маркеров техники
const addEquipmentMarkers = () => {
  if (!map) return

  // Очищаем существующие маркеры
  markers.value.forEach(marker => marker.remove())
  markers.value.clear()

  props.vehicles.forEach(equipment => {
    // Определение цвета и иконки в зависимости от типа техники
    const getVehicleStyle = (vehicle: Vehicle) => {
      const name = vehicle.name.toLowerCase()
      if (name.includes('трактор')) {
        return {
          color: 'bg-green-600',
          icon: '🚜',
          type: 'Трактор'
        }
      } else if (name.includes('комбайн')) {
        return {
          color: 'bg-yellow-600',
          icon: '🌾',
          type: 'Комбайн'
        }
      } else {
        return {
          color: 'bg-blue-600',
          icon: '🚛',
          type: 'Техника'
        }
      }
    }

    const vehicleStyle = getVehicleStyle(equipment)
    const isSelected = props.selectedVehicleId === equipment.id
    const borderColor = isSelected ? 'border-blue-400 border-4' : 'border-white border-2'
    const markerSize = isSelected ? 'w-12 h-12' : 'w-10 h-10'

    // Создание HTML элемента для маркера
    const markerElement = document.createElement('div')
    markerElement.className = 'equipment-marker'
    markerElement.innerHTML = `
      <div class="marker-content ${vehicleStyle.color} text-white rounded-full ${markerSize} flex items-center justify-center shadow-lg ${borderColor} transition-all duration-300">
        <span class="text-lg">${vehicleStyle.icon}</span>
      </div>
    `

    // Добавление обработчика клика
    markerElement.addEventListener('click', () => {
      if (props.selectedVehicleId === equipment.id) {
        emit('vehicleDeselected')
      } else {
        emit('vehicleSelected', equipment.id)
      }
    })

    // Создание маркера
    const marker = new maplibregl.Marker(markerElement)
      .setLngLat([equipment.lng, equipment.lat])
      .addTo(map)

    // Сохраняем маркер для управления
    markers.value.set(equipment.id, marker)

    // Создание popup с информацией
    const popup = new maplibregl.Popup({ offset: 25 })
      .setHTML(`
        <div class="p-3">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">${vehicleStyle.icon}</span>
            <h3 class="font-bold text-gray-900">${equipment.name}</h3>
          </div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Тип:</span>
              <span class="font-medium text-gray-800">${vehicleStyle.type}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Статус:</span>
              <span class="font-medium ${equipment.status === 'active' ? 'text-green-600' : 'text-red-600'}">
                ${equipment.status === 'active' ? 'Активен' : equipment.status === 'stopped' ? 'Остановлен' : 'Простой'}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Скорость:</span>
              <span class="font-medium text-gray-800">${equipment.speed} км/ч</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Координаты:</span>
              <span class="font-medium text-gray-800">${equipment.lat.toFixed(4)}, ${equipment.lng.toFixed(4)}</span>
            </div>
            ${equipment.battery ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Батарея:</span>
              <span class="font-medium text-gray-800">${equipment.battery.toFixed(1)}%</span>
            </div>
            ` : ''}
            ${equipment.temperature ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Температура:</span>
              <span class="font-medium text-gray-800">${equipment.temperature.toFixed(1)}°C</span>
            </div>
            ` : ''}
            ${equipment.rpm ? `
            <div class="flex justify-between">
              <span class="text-gray-600">RPM:</span>
              <span class="font-medium text-gray-800">${equipment.rpm}</span>
            </div>
            ` : ''}
            ${equipment.lastUpdate ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Обновлено:</span>
              <span class="font-medium text-gray-800">${new Date(equipment.lastUpdate).toLocaleTimeString('ru-RU')}</span>
            </div>
            ` : ''}
          </div>
        </div>
      `)

    marker.setPopup(popup)
  })

  equipmentCount.value = props.vehicles.length
}

// Центрирование на технике
const centerOnEquipment = () => {
  if (!map || props.vehicles.length === 0) return

  if (props.vehicles.length === 1) {
    // Если одна единица техники, центрируем на ней
    const vehicle = props.vehicles[0]
    map.flyTo({
      center: [vehicle.lng, vehicle.lat],
      zoom: 15,
      duration: 1000
    })
  } else {
    // Если несколько единиц, показываем все
    const bounds = new maplibregl.LngLatBounds()
    props.vehicles.forEach(equipment => {
      bounds.extend([equipment.lng, equipment.lat])
    })

    map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15,
      duration: 1000
    })
  }
}

// Центрирование на конкретной технике
const centerOnVehicle = (vehicleId: string) => {
  if (!map) return
  
  const vehicle = props.vehicles.find(v => v.id === vehicleId)
  if (vehicle) {
    map.flyTo({
      center: [vehicle.lng, vehicle.lat],
      zoom: 16,
      duration: 1000
    })
  }
}

// Установка стиля карты
const setMapStyle = (styleKey: string) => {
  if (!map) return

  currentStyle.value = styleKey
  currentStyleIndex.value = Object.keys(mapStyles).indexOf(styleKey)
  
  const newStyle = mapStyles[styleKey as keyof typeof mapStyles]
  
  console.log(`🗺️ Переключение на: ${newStyle.name}`)
  
  const styleUrl = typeof newStyle.url === 'string' ? newStyle.url : newStyle.url
  map.setStyle(styleUrl)
  
  // Переинициализация маркеров после смены стиля
  map.once('styledata', () => {
    addEquipmentMarkers()
  })
  
  showStylePanel.value = false
}

// Переключение стиля карты
const toggleMapStyle = () => {
  if (!map) return

  // Получаем список всех доступных стилей
  const styleKeys = Object.keys(mapStyles)
  
  // Переходим к следующему стилю
  currentStyleIndex.value = (currentStyleIndex.value + 1) % styleKeys.length
  const newStyleKey = styleKeys[currentStyleIndex.value]
  
  setMapStyle(newStyleKey)
}

// Watchers для отслеживания изменений
watch(() => props.vehicles, () => {
  if (map && mapLoaded.value) {
    addEquipmentMarkers()
  }
}, { deep: true })

watch(() => props.selectedVehicleId, (newId, oldId) => {
  if (map && mapLoaded.value) {
    addEquipmentMarkers() // Перерисовываем маркеры с новым выделением
    
    // Центрируем на выбранной технике
    if (newId) {
      centerOnVehicle(newId)
    }
  }
})

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
  centerOnVehicle,
  toggleMapStyle,
  setMapStyle,
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