'use client'

import { useEffect, useRef, useState } from 'react'
import { type Activity } from '@/lib/ai'
import { getConfig } from '@/lib/config'

interface MapViewProps {
  activities: Activity[]
  center?: { lat: number; lng: number }
  zoom?: number
  onMarkerClick?: (activity: Activity, index: number) => void
  highlightedActivityId?: string
  focusActivity?: Activity | null // 用于外部控制地图跳转到指定活动
}

type UpdateOptions = {
  center?: { lat: number; lng: number }
  zoom?: number
}

// 判断地点是否在中国境内（粗略判断）
function isInChina(lat: number, lng: number): boolean {
  // 中国大致边界：纬度 18°-54°，经度 73°-135°
  return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135
}

// 根据地点位置计算合适的缩放级别
function calculateOptimalZoom(activities: Activity[]): number {
  if (activities.length === 0) return 13
  
  // 检查所有活动是否都在中国
  const allInChina = activities.every(activity => {
    const lat = activity.location.lat
    const lng = activity.location.lng
    if (lat === undefined || lng === undefined) return true // 默认按中国处理
    return isInChina(lat, lng)
  })
  
  // 如果所有活动都在中国，使用较低的缩放级别（高德地图对国内支持好）
  // 如果有国外地点，使用更高的缩放级别以获得更多细节
  return allInChina ? 13 : 16
}

export default function MapView({ 
  activities, 
  center, 
  zoom = 15, // 提高默认缩放级别以显示更详细的街道信息
  onMarkerClick,
  highlightedActivityId,
  focusActivity
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapLoaded) return

    const config = getConfig()
    const amapKey = config.amapKey

    if (!amapKey) {
      console.warn('高德地图API Key未配置')
      return
    }

    const initializeMap = () => {
      if (!mapRef.current) return

      const calculatedCenter = center || (() => {
        if (activities.length === 0) {
          return [116.397428, 39.90923] // 默认北京
        }
        const lats = activities
          .map((a) => a.location.lat)
          .filter((lat): lat is number => lat !== undefined)
        const lngs = activities
          .map((a) => a.location.lng)
          .filter((lng): lng is number => lng !== undefined)

        if (lats.length === 0 || lngs.length === 0) {
          return [116.397428, 39.90923]
        }

        return [
          lngs.reduce((a, b) => a + b, 0) / lngs.length,
          lats.reduce((a, b) => a + b, 0) / lats.length,
        ]
      })()

      // 根据地点位置计算合适的缩放级别
      const optimalZoom = zoom || calculateOptimalZoom(activities)
      
      // 判断是否包含国外地点
      const hasForeignLocation = activities.some(activity => {
        const lat = activity.location.lat
        const lng = activity.location.lng
        if (lat === undefined || lng === undefined) return false
        return !isInChina(lat, lng)
      })
      
      // 对于国外地点，使用更高的最大缩放级别和更详细的地图要素
      const maxZoom = hasForeignLocation ? 20 : 18
      // 国外地点需要显示更多细节：道路、建筑、标签等
      // 注意：高德地图对国外地图的详细数据支持有限，这是高德地图本身的限制
      const mapFeatures = hasForeignLocation 
        ? ['bg', 'point', 'road', 'building', 'label'] // 国外地点显示更多细节
        : ['bg', 'point', 'road'] // 国内地点保持简洁以提高性能
      
      // 对于国外地点，尝试使用不同的地图样式
      // 注意：高德地图对国外地图的支持有限，详细街道信息可能无法显示
      // 这是高德地图数据源的限制，不是代码问题
      const mapStyle = hasForeignLocation 
        ? 'amap://styles/darkblue' // 尝试使用深蓝样式，可能显示更多细节
        : 'amap://styles/normal' // 国内使用标准样式

      const mapConfig: any = {
        zoom: optimalZoom,
        center: calculatedCenter,
        mapStyle: mapStyle, // 根据地点位置动态调整地图样式
        viewMode: '2D', // 使用2D视图以提高性能
        features: mapFeatures, // 根据地点位置动态调整地图要素
        zoomEnable: true, // 启用缩放
        dragEnable: true, // 启用拖拽
        doubleClickZoom: true, // 启用双击缩放
        keyboardEnable: false, // 禁用键盘操作以提高性能
        resizeEnable: true, // 启用自适应尺寸
        zooms: [3, maxZoom], // 根据地点位置动态调整最大缩放级别
        lazyLoad: true, // 启用懒加载
      }
      
      // 对于国外地点，尝试启用更多地图要素（如果API支持）
      if (hasForeignLocation) {
        // 尝试使用更详细的地图配置
        mapConfig.showIndoorMap = false // 关闭室内地图以提高性能
        mapConfig.rotateEnable = false // 关闭旋转以提高性能
        mapConfig.pitchEnable = false // 关闭俯仰以提高性能
        // 尝试强制显示更多细节
        mapConfig.showLabel = true // 尝试显示标签
      }

      const map = new (window as any).AMap.Map(mapRef.current, mapConfig)

      mapInstanceRef.current = map
      
      // 地图加载完成后，延迟加载控件以提高初始渲染速度
      map.on('complete', () => {
        // 确保地图尺寸正确 - 高德地图需要知道容器尺寸
        setTimeout(() => {
          try {
            // 强制地图重新计算尺寸
            if (mapRef.current && map) {
              const rect = mapRef.current.getBoundingClientRect()
              if (rect.width > 0 && rect.height > 0) {
                // 调用 resize 方法确保地图正确填充容器
                // 高德地图 2.0 API 会自动处理，但我们可以确保它知道新尺寸
                const currentSize = map.getSize()
                if (!currentSize || currentSize.width !== rect.width || currentSize.height !== rect.height) {
                  // 触发地图重新计算尺寸
                  map.getSize()
                }
              }
            }
          } catch (e) {
            // 忽略错误，高德地图会自动处理
            console.warn('Map resize check failed:', e)
          }
        }, 300)
        
        // 延迟加载控件，不阻塞地图渲染
        setTimeout(() => {
          map.plugin(['AMap.Scale'], () => {
            const scale = new (window as any).AMap.Scale({
              position: 'LB',
            })
            map.addControl(scale)
          })
        }, 500)
        
        // 确保地图以合适的缩放级别显示（根据地点位置动态调整）
        const hasForeignLocation = activities.some(activity => {
          const lat = activity.location.lat
          const lng = activity.location.lng
          if (lat === undefined || lng === undefined) return false
          return !isInChina(lat, lng)
        })
        const minZoom = hasForeignLocation ? 16 : 13
        const currentZoom = map.getZoom()
        if (currentZoom < minZoom && activities.length > 0) {
          map.setZoom(minZoom)
        }
      })

      setMapLoaded(true)

      // 立即更新标记，不等待地图完全加载
      updateMarkers(activities, map, { center, zoom })
    }

    if ((window as any).AMap) {
      initializeMap()
      return
    }

    ;(window as any).initAMap = () => {
      initializeMap()
    }

    let script = document.getElementById('amap-sdk-script') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'amap-sdk-script'
      // 使用最新版本并加载必要的插件
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&callback=initAMap`
      script.async = true
      document.head.appendChild(script)
    }

    return () => {
      if ((window as any).initAMap) {
        delete (window as any).initAMap
      }
    }
  }, [activities, center, mapLoaded, zoom])

  // 监听容器尺寸变化，自动调整地图尺寸
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !mapRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      if (mapInstanceRef.current && entries.length > 0) {
        const entry = entries[0]
        const { width, height } = entry.contentRect
        
        if (width > 0 && height > 0) {
          try {
            // 高德地图会自动检测容器尺寸变化（resizeEnable: true）
            // 但有时需要手动触发，确保地图正确渲染
            setTimeout(() => {
              if (mapInstanceRef.current) {
                // 获取当前地图尺寸
                const currentSize = mapInstanceRef.current.getSize()
                // 如果尺寸不匹配，触发重新渲染
                if (!currentSize || Math.abs(currentSize.width - width) > 1 || Math.abs(currentSize.height - height) > 1) {
                  // 高德地图会自动处理，这里只是确保它知道尺寸变化
                  mapInstanceRef.current.getSize()
                }
              }
            }, 50)
          } catch (e) {
            // 忽略错误，高德地图会自动处理
          }
        }
      }
    })

    resizeObserver.observe(mapRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [mapLoaded])

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return
    updateMarkers(activities, mapInstanceRef.current, { center, zoom })
  }, [activities, center, mapLoaded, zoom, highlightedActivityId, onMarkerClick])

  // 监听 focusActivity 变化，跳转到指定活动位置
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !focusActivity) return
    
    const lat = focusActivity.location.lat
    const lng = focusActivity.location.lng
    
    if (
      typeof lat === 'number' && typeof lng === 'number' &&
      !isNaN(lat) && !isNaN(lng) &&
      isFinite(lat) && isFinite(lng) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    ) {
      try {
        // 跳转到指定位置，根据地点位置动态调整缩放级别
        // 国外地点使用更高的缩放级别以获得更多细节
        const optimalZoom = isInChina(lat, lng) ? 15 : 17
        mapInstanceRef.current.setZoomAndCenter(optimalZoom, [lng, lat])
      } catch (error) {
        console.warn('Error focusing on activity:', error)
      }
    }
  }, [focusActivity, mapLoaded])

  const updateMarkers = (acts: Activity[], map: any, options: UpdateOptions = {}) => {
    markersRef.current.forEach((marker) => {
      map.remove(marker)
    })
    markersRef.current = []

    acts.forEach((activity, index) => {
      // 严格验证坐标，确保是有效的数字且不是 NaN
      const lat = typeof activity.location.lat === 'number' ? activity.location.lat : null
      const lng = typeof activity.location.lng === 'number' ? activity.location.lng : null
      
      // 验证坐标是否有效（不是 NaN、Infinity，且在合理范围内）
      const isValidLat = lat !== null && !isNaN(lat) && isFinite(lat) && lat >= -90 && lat <= 90
      const isValidLng = lng !== null && !isNaN(lng) && isFinite(lng) && lng >= -180 && lng <= 180
      
      if (isValidLat && isValidLng) {
        // 根据活动类型设置不同的图标颜色
        const getMarkerColor = (type: string) => {
          switch (type) {
            case 'attraction': return '#3B82F6' // 蓝色
            case 'restaurant': return '#10B981' // 绿色
            case 'hotel': return '#8B5CF6' // 紫色
            case 'transport': return '#F59E0B' // 橙色
            default: return '#6B7280' // 灰色
          }
        }

        const isHighlighted = highlightedActivityId === activity.name
        const markerColor = isHighlighted ? '#EF4444' : getMarkerColor(activity.type)
        
        // 创建自定义标记，显示地点名称
        // 使用 CSS transform 来居中，避免 offset 计算问题
        const markerContent = document.createElement('div')
        markerContent.style.cssText = `
          background: ${markerColor};
          color: white;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: ${isHighlighted ? '3px solid #FCD34D' : '2px solid white'};
          cursor: pointer;
          transition: all 0.2s;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          transform: translate(-50%, -100%);
          margin-top: -4px;
        `
        markerContent.textContent = activity.name || '地点'
        markerContent.title = activity.name || '地点'

        try {
          // 确保坐标是数字数组
          const position: [number, number] = [Number(lng), Number(lat)]
          
          // 再次验证 position 数组中的值
          if (isNaN(position[0]) || isNaN(position[1]) || !isFinite(position[0]) || !isFinite(position[1])) {
            console.warn('Invalid coordinates for activity:', activity.name, { lat, lng })
            return // 跳过这个标记
          }

          // 不设置 offset，使用 CSS transform 来居中标记
          const marker = new (window as any).AMap.Marker({
            position: position,
            content: markerContent,
            // 不设置 offset，让 CSS transform 处理居中
            title: activity.name || '地点',
          })

          marker.setMap(map)

          const infoWindow = new (window as any).AMap.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 220px; max-width: 300px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1F2937;">${activity.name}</h3>
                <div style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 8px; background: ${getMarkerColor(activity.type)}; color: white;">
                  ${activity.type === 'attraction' ? '🏛️ 景点' : activity.type === 'restaurant' ? '🍽️ 餐厅' : activity.type === 'hotel' ? '🏨 住宿' : '🚗 交通'}
                </div>
                <p style="margin: 4px 0; color: #6B7280; font-size: 13px;"><strong>时间:</strong> ${activity.time}</p>
                ${activity.description ? `<p style="margin: 8px 0 4px 0; color: #374151; font-size: 13px; line-height: 1.5;">${activity.description}</p>` : ''}
                ${activity.duration ? `<p style="margin: 4px 0; color: #6B7280; font-size: 12px;">⏱️ 预计时长: ${activity.duration}</p>` : ''}
                ${activity.estimatedCost !== undefined && activity.estimatedCost !== null ? `<p style="margin: 4px 0; color: #059669; font-size: 13px; font-weight: 600;">💰 预估费用: ¥${activity.estimatedCost}</p>` : ''}
                <p style="margin: 8px 0 0 0; color: #9CA3AF; font-size: 11px;">📍 ${activity.location.name}</p>
              </div>
            `,
          })

          marker.on('click', () => {
            infoWindow.open(map, marker.getPosition())
            if (onMarkerClick) {
              onMarkerClick(activity, index)
            }
          })

          // 鼠标悬停效果
          markerContent.addEventListener('mouseenter', () => {
            markerContent.style.transform = 'scale(1.1) translate(-50%, -100%)'
            markerContent.style.zIndex = '1000'
          })
          markerContent.addEventListener('mouseleave', () => {
            markerContent.style.transform = 'scale(1) translate(-50%, -100%)'
          })

          markersRef.current.push(marker)
        } catch (error) {
          console.error('Error creating marker for activity:', activity.name, error)
          return // 跳过这个标记
        }
      }
    })

    if (options.center) {
      // 验证中心点坐标
      const centerLng = options.center.lng
      const centerLat = options.center.lat
      
      if (
        typeof centerLng === 'number' && typeof centerLat === 'number' &&
        !isNaN(centerLng) && !isNaN(centerLat) &&
        isFinite(centerLng) && isFinite(centerLat) &&
        centerLng >= -180 && centerLng <= 180 &&
        centerLat >= -90 && centerLat <= 90
      ) {
        // 如果指定了中心点，根据地点位置动态调整缩放级别
        const hasForeignLocation = acts.some(activity => {
          const lat = activity.location.lat
          const lng = activity.location.lng
          if (lat === undefined || lng === undefined) return false
          return !isInChina(lat, lng)
        })
        const minZoom = hasForeignLocation ? 16 : 13
        const targetZoom = options.zoom ?? Math.max(map.getZoom(), minZoom)
        const validZoom = isNaN(targetZoom) || !isFinite(targetZoom) ? minZoom : Math.max(targetZoom, minZoom)
        
        try {
          map.setZoomAndCenter(validZoom, [centerLng, centerLat])
        } catch (error) {
          console.warn('Error in setZoomAndCenter:', error)
        }
      } else {
        console.warn('Invalid center coordinates:', options.center)
      }
      return
    }

    if (markersRef.current.length > 0) {
      // 过滤出有效的标记位置
      const validPositions: [number, number][] = []
      markersRef.current.forEach((marker) => {
        try {
          const pos = marker.getPosition()
          if (pos && Array.isArray(pos) && pos.length >= 2) {
            const lng = pos[0]
            const lat = pos[1]
            // 验证坐标是否有效
            if (
              typeof lng === 'number' && typeof lat === 'number' &&
              !isNaN(lng) && !isNaN(lat) &&
              isFinite(lng) && isFinite(lat) &&
              lng >= -180 && lng <= 180 &&
              lat >= -90 && lat <= 90
            ) {
              validPositions.push([lng, lat])
            }
          }
        } catch (error) {
          console.warn('Error getting marker position:', error)
        }
      })

      if (validPositions.length > 0) {
        // 判断是否包含国外地点
        const hasForeignLocation = validPositions.some(([lng, lat]) => !isInChina(lat, lng))
        
        // 使用 setFitView 自动适配所有标记
        // 参数说明：markers, immediately, avoid, maxZoom
        // avoid: [top, right, bottom, left] 避让的像素范围
        // maxZoom: 根据地点位置动态调整最大缩放级别
        // 国外地点使用更高的缩放级别以获得更多细节
        const baseMaxZoom = hasForeignLocation ? 17 : 13
        const maxZoom = validPositions.length <= 3 
          ? (hasForeignLocation ? 18 : 14) 
          : baseMaxZoom
        
        try {
          // 使用异步方式设置视图，不阻塞渲染
          requestAnimationFrame(() => {
            try {
              map.setFitView(markersRef.current, false, [20, 20, 20, 20], maxZoom)
            } catch (error) {
              console.warn('Error in setFitView:', error)
              // 如果 setFitView 失败，手动计算中心点
              const centerLng = validPositions.reduce((sum, pos) => sum + pos[0], 0) / validPositions.length
              const centerLat = validPositions.reduce((sum, pos) => sum + pos[1], 0) / validPositions.length
              
              if (!isNaN(centerLng) && !isNaN(centerLat) && isFinite(centerLng) && isFinite(centerLat)) {
                const optimalZoom = isInChina(centerLat, centerLng) ? 13 : 16
                map.setZoomAndCenter(optimalZoom, [centerLng, centerLat])
              }
            }
          })
        } catch (error) {
          console.warn('Error in setFitView, using manual center calculation:', error)
          // 如果 setFitView 失败，手动计算中心点
          const centerLng = validPositions.reduce((sum, pos) => sum + pos[0], 0) / validPositions.length
          const centerLat = validPositions.reduce((sum, pos) => sum + pos[1], 0) / validPositions.length
          
          if (!isNaN(centerLng) && !isNaN(centerLat) && isFinite(centerLng) && isFinite(centerLat)) {
            const optimalZoom = isInChina(centerLat, centerLng) ? 13 : 16
            map.setZoomAndCenter(optimalZoom, [centerLng, centerLat])
          }
        }
      }
    } else if (typeof options.zoom === 'number') {
      // 根据活动位置动态调整默认缩放级别
      const hasForeignLocation = acts.some(activity => {
        const lat = activity.location.lat
        const lng = activity.location.lng
        if (lat === undefined || lng === undefined) return false
        return !isInChina(lat, lng)
      })
      const minZoom = hasForeignLocation ? 16 : 13
      const targetZoom = Math.max(options.zoom, minZoom)
      const maxZoom = hasForeignLocation ? 20 : 18
      if (!isNaN(targetZoom) && isFinite(targetZoom) && targetZoom >= 3 && targetZoom <= maxZoom) {
        try {
          map.setZoom(targetZoom)
        } catch (error) {
          console.warn('Error in setZoom:', error)
        }
      }
    } else {
      // 默认情况下根据地点位置动态调整缩放级别
      try {
        const hasForeignLocation = acts.some(activity => {
          const lat = activity.location.lat
          const lng = activity.location.lng
          if (lat === undefined || lng === undefined) return false
          return !isInChina(lat, lng)
        })
        const minZoom = hasForeignLocation ? 16 : 13
        const currentZoom = map.getZoom()
        if (typeof currentZoom === 'number' && !isNaN(currentZoom) && isFinite(currentZoom) && currentZoom < minZoom) {
          map.setZoom(minZoom)
        }
      } catch (error) {
        console.warn('Error getting/setting zoom:', error)
        // 如果获取缩放级别失败，直接设置默认值
        try {
          const hasForeignLocation = acts.some(activity => {
            const lat = activity.location.lat
            const lng = activity.location.lng
            if (lat === undefined || lng === undefined) return false
            return !isInChina(lat, lng)
          })
          const defaultZoom = hasForeignLocation ? 16 : 13
          map.setZoom(defaultZoom)
        } catch (setZoomError) {
          console.error('Error setting default zoom:', setZoomError)
        }
      }
    }
  }

  if (!getConfig().amapKey) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>高德地图API Key未配置</p>
          <p className="text-sm mt-2">请在设置页面配置高德地图API Key</p>
        </div>
      </div>
    )
  }

  // 检查是否有国外地点
  const hasForeignLocation = activities.some(activity => {
    const lat = activity.location.lat
    const lng = activity.location.lng
    if (lat === undefined || lng === undefined) return false
    return !isInChina(lat, lng)
  })

  return (
    <div className="w-full h-full relative">
      {hasForeignLocation && (
        <div className="absolute top-2 left-2 z-10 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 max-w-[calc(100%-16px)] shadow-sm">
          <p className="font-semibold">⚠️ 地图提示：</p>
          <p>高德地图对国外地区（如韩国、日本等）的详细街道信息支持有限，可能无法显示完整的街道和建筑细节。这是高德地图数据源的限制。</p>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
    </div>
  )
}

declare global {
  interface Window {
    initAMap?: () => void
  }
}
