'use client'

import { useEffect, useRef, useState } from 'react'
import { type Activity } from '@/lib/ai'
import { getConfig } from '@/lib/config'

interface MapViewProps {
  activities: Activity[]
  center?: { lat: number; lng: number }
  zoom?: number
}

export default function MapView({ activities, center, zoom = 13 }: MapViewProps) {
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

    // 动态加载高德地图
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&callback=initAMap`
    script.async = true

    window.initAMap = () => {
      if (!mapRef.current) return

      // 计算中心点
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

      const map = new (window as any).AMap.Map(mapRef.current, {
        zoom,
        center: calculatedCenter,
        mapStyle: 'amap://styles/normal',
      })

      mapInstanceRef.current = map
      setMapLoaded(true)

      // 添加标记点
      updateMarkers(activities, map)
    }

    document.head.appendChild(script)

    return () => {
      // 清理
      if (window.initAMap) {
        delete (window as any).initAMap
      }
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return
    updateMarkers(activities, mapInstanceRef.current)
  }, [activities, mapLoaded])

  const updateMarkers = (acts: Activity[], map: any) => {
    // 清除旧标记
    markersRef.current.forEach((marker) => {
      map.remove(marker)
    })
    markersRef.current = []

    // 添加新标记
    acts.forEach((activity, index) => {
      if (activity.location.lat && activity.location.lng) {
        const marker = new (window as any).AMap.Marker({
          position: [activity.location.lng, activity.location.lat],
          title: activity.name,
          label: {
            content: `${index + 1}`,
            direction: 'right',
          },
        })

        marker.setMap(map)
        
        // 添加信息窗口
        const infoWindow = new (window as any).AMap.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${activity.name}</h3>
              <p style="margin: 4px 0; color: #666; font-size: 12px;">${activity.type === 'attraction' ? '景点' : activity.type === 'restaurant' ? '餐厅' : activity.type === 'hotel' ? '住宿' : '交通'}</p>
              <p style="margin: 4px 0; color: #666; font-size: 12px;">时间: ${activity.time}</p>
              ${activity.description ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">${activity.description}</p>` : ''}
              ${activity.estimatedCost ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">费用: ¥${activity.estimatedCost}</p>` : ''}
            </div>
          `,
        })

        marker.on('click', () => {
          infoWindow.open(map, marker.getPosition())
        })

        markersRef.current.push(marker)
      }
    })

    // 如果有多个标记，调整地图视野
    if (markersRef.current.length > 1) {
      const bounds = new (window as any).AMap.Bounds()
      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getPosition())
      })
      map.setBounds(bounds)
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

  return (
    <div ref={mapRef} className="w-full h-96 rounded-lg overflow-hidden" />
  )
}

declare global {
  interface Window {
    initAMap?: () => void
  }
}
