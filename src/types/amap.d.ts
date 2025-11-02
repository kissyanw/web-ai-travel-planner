declare namespace AMap {
  class Map {
    constructor(container: HTMLElement | string, opts?: MapOptions)
    setZoom(zoom: number): void
    setCenter(location: [number, number] | Location): void
    setBounds(bounds: Bounds): void
    remove(layer: any): void
  }

  interface MapOptions {
    zoom?: number
    center?: [number, number] | Location
    mapStyle?: string
  }

  class Marker {
    constructor(opts?: MarkerOptions)
    setMap(map: Map | null): void
    getPosition(): [number, number]
    on(event: string, callback: () => void): void
  }

  interface MarkerOptions {
    position?: [number, number]
    title?: string
    label?: LabelOptions
  }

  interface LabelOptions {
    content?: string
    direction?: string
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions)
    open(map: Map, position: [number, number]): void
  }

  interface InfoWindowOptions {
    content?: string
  }

  class Bounds {
    constructor()
    extend(position: [number, number]): void
  }

  interface Location {
    lng: number
    lat: number
  }
}
