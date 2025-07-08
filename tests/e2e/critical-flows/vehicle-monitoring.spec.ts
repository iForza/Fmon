import { test, expect } from '@playwright/test'

/**
 * E2E тесты критических пользовательских сценариев
 * Мониторинг сельскохозяйственной техники
 */
test.describe('Vehicle Monitoring - Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Переход на главную страницу
    await page.goto('/')
    
    // Ожидание загрузки приложения
    await page.waitForSelector('[data-testid="app-header"]', { timeout: 10000 })
  })

  test('should display main monitoring interface', async ({ page }) => {
    // Проверка основных элементов интерфейса
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    
    // Проверка навигационных элементов
    await expect(page.locator('text=Мониторинг')).toBeVisible()
    await expect(page.locator('text=Аналитика')).toBeVisible()
    await expect(page.locator('text=История')).toBeVisible()
  })

  test('should navigate between main sections', async ({ page }) => {
    // Навигация в аналитику
    await page.click('text=Аналитика')
    await page.waitForURL('**/analytics')
    await expect(page.locator('h1:has-text("Аналитика")')).toBeVisible()

    // Навигация в историю
    await page.click('text=История')
    await page.waitForURL('**/history')
    await expect(page.locator('h1:has-text("История MQTT")')).toBeVisible()

    // Возврат к мониторингу
    await page.click('text=Мониторинг')
    await page.waitForURL('/')
  })

  test('should display vehicle list when available', async ({ page }) => {
    // Ожидание загрузки списка техники
    const vehicleList = page.locator('[data-testid="vehicle-list"]')
    
    // Проверка, что список либо пустой, либо содержит технику
    await expect(vehicleList).toBeVisible()
    
    // Если есть техника в списке
    const vehicleCount = await page.locator('[data-testid="vehicle-item"]').count()
    
    if (vehicleCount > 0) {
      // Проверяем первый элемент списка
      const firstVehicle = page.locator('[data-testid="vehicle-item"]').first()
      await expect(firstVehicle).toBeVisible()
      
      // Проверяем наличие основной информации о технике
      await expect(firstVehicle.locator('.vehicle-name')).toBeVisible()
      await expect(firstVehicle.locator('.vehicle-status')).toBeVisible()
    }
  })

  test('should display map component', async ({ page }) => {
    // Проверка наличия карты
    const mapContainer = page.locator('[data-testid="map-container"]')
    await expect(mapContainer).toBeVisible()
    
    // Ожидание инициализации карты
    await page.waitForTimeout(2000)
    
    // Проверка элементов управления картой (если есть)
    const mapControls = page.locator('.maplibregl-ctrl-group')
    if (await mapControls.count() > 0) {
      await expect(mapControls.first()).toBeVisible()
    }
  })

  test('should handle API connection status', async ({ page }) => {
    // Проверка индикатора состояния API
    const statusIndicator = page.locator('[data-testid="api-status"]')
    
    // Статус должен быть видим
    if (await statusIndicator.count() > 0) {
      await expect(statusIndicator).toBeVisible()
      
      // Проверяем, что есть какой-то статус
      const statusText = await statusIndicator.textContent()
      expect(statusText).toBeTruthy()
    }
  })

  test('should display real-time updates when available', async ({ page }) => {
    // Ожидание потенциальных обновлений данных
    await page.waitForTimeout(3000)
    
    // Проверка timestamp последнего обновления
    const lastUpdate = page.locator('[data-testid="last-update"]')
    if (await lastUpdate.count() > 0) {
      const updateText = await lastUpdate.textContent()
      expect(updateText).toBeTruthy()
    }
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Тест на мобильном размере экрана
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Основные элементы должны остаться видимыми
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible()
    
    // Навигация может быть свернута на мобильных
    const navToggle = page.locator('[data-testid="nav-toggle"]')
    if (await navToggle.count() > 0) {
      await expect(navToggle).toBeVisible()
    }
    
    // Возврат к desktop размеру
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Мониторинг консольных ошибок
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Навигация по приложению
    await page.click('text=Аналитика')
    await page.waitForTimeout(1000)
    
    await page.click('text=История')
    await page.waitForTimeout(1000)
    
    await page.click('text=Мониторинг')
    await page.waitForTimeout(1000)

    // Проверяем, что нет критических ошибок
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') ||
      error.includes('SyntaxError')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })

  test('should maintain performance standards', async ({ page }) => {
    // Начало измерения производительности
    await page.evaluate(() => performance.mark('navigation-start'))
    
    // Навигация между страницами
    await page.click('text=Аналитика')
    await page.waitForLoadState('networkidle')
    
    await page.click('text=История')
    await page.waitForLoadState('networkidle')
    
    await page.click('text=Мониторинг')
    await page.waitForLoadState('networkidle')
    
    // Окончание измерения
    const navigationTime = await page.evaluate(() => {
      performance.mark('navigation-end')
      performance.measure('navigation-duration', 'navigation-start', 'navigation-end')
      const measure = performance.getEntriesByName('navigation-duration')[0]
      return measure.duration
    })
    
    // Навигация должна быть быстрой (менее 3 секунд)
    expect(navigationTime).toBeLessThan(3000)
  })
}) 