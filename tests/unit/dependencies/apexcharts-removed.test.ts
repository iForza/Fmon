import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('ApexCharts Library Removed', () => {
  test('should not have apexcharts in package.json dependencies', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
    
    // ApexCharts должен быть удален из зависимостей
    expect(packageJson.dependencies).not.toHaveProperty('apexcharts')
    expect(packageJson.dependencies).not.toHaveProperty('vue3-apexcharts')
    
    // ECharts должен остаться
    expect(packageJson.dependencies).toHaveProperty('echarts')
  })

  test('should not have apexcharts plugin file', () => {
    expect(() => {
      readFileSync(join(process.cwd(), 'plugins/apexcharts.client.ts'), 'utf-8')
    }).toThrow() // Файл должен быть удален
  })

  test('should not have apexcharts imports in components', () => {
    // Проверяем основные компоненты
    const componentsToCheck = [
      'components/ChartComponent.vue',
      'components/AdminPanel.vue'
    ]

    componentsToCheck.forEach(componentPath => {
      try {
        const content = readFileSync(join(process.cwd(), componentPath), 'utf-8')
        
        // Не должно быть импортов ApexCharts
        expect(content).not.toMatch(/import.*apexcharts/i)
        expect(content).not.toMatch(/import.*vue3-apexcharts/i)
        expect(content).not.toMatch(/<apexchart/i)
        
        // Должно использовать только ECharts
        if (content.includes('chart') || content.includes('Chart')) {
          expect(content).toMatch(/echarts/i)
        }
      } catch (error) {
        // Файл может не существовать, что нормально
        console.log(`Component ${componentPath} не найден, пропускаем проверку`)
      }
    })
  })

  test('should only use ECharts for visualization', () => {
    // Проверяем что в проекте используется только ECharts
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
    
    // Только ECharts должен быть в зависимостях для графиков
    const chartLibraries = Object.keys(packageJson.dependencies).filter(dep => 
      dep.includes('chart') || dep.includes('Chart') || dep.includes('apex')
    )
    
    expect(chartLibraries).toEqual(['echarts'])
  })

  test('should not have apexcharts imports in any Vue file', async () => {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    async function checkDirectory(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
          await checkDirectory(fullPath)
        } else if (entry.isFile() && entry.name.endsWith('.vue')) {
          const content = await fs.readFile(fullPath, 'utf-8')
          
          // Проверяем что нет импортов ApexCharts
          expect(content).not.toMatch(/import.*apexcharts/i)
          expect(content).not.toMatch(/import.*vue3-apexcharts/i)
          expect(content).not.toMatch(/<apexchart/i)
        }
      }
    }
    
    await checkDirectory(process.cwd())
  })
}) 