'use client'

import { useState, useEffect, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type Resolution = {
  name: string;
  width: number;
  height: number;
}

const resolutions: Resolution[] = [
  { name: 'WUXGA', width: 1920, height: 1200 },
  { name: 'FHD', width: 1920, height: 1080 },
  { name: 'UHD', width: 3840, height: 2160 },
  { name: '4K', width: 4096, height: 2160 },
]

const defaultValues = {
  distance: 5,
  lumens: 3000,
  resolution: resolutions[0],
  throwRatio: 1.5,
}

export default function ProjectorScreenInterface() {
  const [distance, setDistance] = useState(defaultValues.distance)
  const [lumens, setLumens] = useState(defaultValues.lumens)
  const [resolution, setResolution] = useState<Resolution>(defaultValues.resolution)
  const [throwRatio, setThrowRatio] = useState(defaultValues.throwRatio)
  const [screenWidth, setScreenWidth] = useState(0)
  const [screenHeight, setScreenHeight] = useState(0)
  const [lux, setLux] = useState(0)
  const [nits, setNits] = useState(0)
  const [pixelSize, setPixelSize] = useState(0)
  const [dragPosition, setDragPosition] = useState(0)

  const calculateAll = useCallback(() => {
    if (throwRatio <= 0) return

    const width = distance / throwRatio
    setScreenWidth(width)
    const height = width * (resolution.height / resolution.width)
    setScreenHeight(height)

    const area = width * height
    if (area <= 0) return
    const calculatedLux = lumens / area
    setLux(calculatedLux)
    setNits(calculatedLux / Math.PI)

    const screenHeightMm = height * 1000
    const pixelSizeMm = screenHeightMm / resolution.height
    setPixelSize(pixelSizeMm)
  }, [distance, lumens, resolution, throwRatio])

  useEffect(() => {
    calculateAll()
  }, [calculateAll])

  useEffect(() => {
    const newDistance = 1 + (dragPosition / 200) * 9
    setDistance(newDistance)
  }, [dragPosition])

  const handleReset = () => {
    setDistance(defaultValues.distance)
    setLumens(defaultValues.lumens)
    setResolution(defaultValues.resolution)
    setThrowRatio(defaultValues.throwRatio)
    setDragPosition(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX
    const startPosition = dragPosition

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const newPosition = Math.max(0, Math.min(200, startPosition + deltaX))
      setDragPosition(newPosition)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Projector-Screen Interface</h1>
      
      <div className="relative h-60 bg-gray-200 rounded-lg overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gray-300"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500 rounded-lg cursor-move flex items-center justify-center text-white"
          style={{ left: `${dragPosition}px` }}
          onMouseDown={handleMouseDown}
        >
          Projector
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="distance">Distance (m)</Label>
          <Input
            id="distance"
            type="number"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            step={0.1}
          />
        </div>
        <div>
          <Label htmlFor="lumens">Lumens</Label>
          <Input
            id="lumens"
            type="number"
            value={lumens}
            onChange={(e) => setLumens(Number(e.target.value))}
            min={0}
            step="any"
          />
        </div>
        <div>
          <Label htmlFor="resolution">Resolution</Label>
          <Select value={resolution.name} onValueChange={(value) => setResolution(resolutions.find(r => r.name === value) || resolutions[0])}>
            <SelectTrigger id="resolution">
              <SelectValue placeholder="Select resolution" />
            </SelectTrigger>
            <SelectContent>
              {resolutions.map((res) => (
                <SelectItem key={res.name} value={res.name}>
                  {res.name} ({res.width}x{res.height})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="throwRatio">Throw Ratio</Label>
          <Input
            id="throwRatio"
            type="number"
            value={throwRatio}
            onChange={(e) => setThrowRatio(Number(e.target.value))}
            step={0.1}
          />
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button onClick={calculateAll}>Apply</Button>
        <Button onClick={handleReset} variant="outline">Reset</Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded-lg">
        <div>
          <p className="font-semibold">Screen Width</p>
          <p>{screenWidth.toFixed(2)} m</p>
        </div>
        <div>
          <p className="font-semibold">Screen Height</p>
          <p>{screenHeight.toFixed(2)} m</p>
        </div>
        <div>
          <p className="font-semibold">Surface Brightness (Lux)</p>
          <p>{lux.toFixed(2)} lux</p>
        </div>
        <div>
          <p className="font-semibold">Surface Brightness (Nits)</p>
          <p>{nits.toFixed(2)} nits</p>
        </div>
        <div>
          <p className="font-semibold">Pixel Size</p>
          <p>{pixelSize.toFixed(2)} mm</p>
        </div>
        <div>
          <p className="font-semibold">Resolution</p>
          <p>{resolution.width}x{resolution.height}</p>
        </div>
      </div>
    </div>
  )
}