/**
 * A canvas based audio scrubber that visualizes the context buffer underneath the track
 */

import React, {
  useEffect,
  useRef
} from 'react'

import { useMantineTheme } from '@mantine/core'

import { useInputAudio } from '../contexts/InputAudioContext'
import { useSettingsStore } from '../store'

interface AudioScrubberProps {
  currentTime: number
  onScrub: (time: number) => void
}

export const AudioScrubber = (props: AudioScrubberProps): JSX.Element => {
  const { currentTime, onScrub } = props
  const { buffer, file, scrubFile, playing } = useInputAudio()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { settings } = useSettingsStore()
  const { colors } = useMantineTheme()

  useEffect(() => {
    if (canvasRef.current == null) {
      return
    }
    let raf = 0
    let mousePositionX = 0
    let timePositionX = 0
    const draw = (): void => {
      if (canvasRef.current != null && buffer != null) {
      // Get the audio data from the AudioBuffer
        const audioData = buffer.getChannelData(0)

        // Get the canvas context
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (ctx == null) {
          return
        }
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Set the canvas fill color
        ctx.fillStyle = '#000'

        // Set the line width
        ctx.lineWidth = 2

        // Set the line cap
        ctx.lineCap = 'round'

        if (mousePositionX !== 0) {
        // Begin a new path for the line where the mouse is hovered
          ctx.beginPath()
          ctx.strokeStyle = colors.gray[5]
          ctx.moveTo(mousePositionX, 0)
          ctx.lineTo(mousePositionX, canvas.height)
          ctx.stroke()
        }

        timePositionX = (currentTime / buffer.duration) * canvas.width

        // Iterate over the audio data
        // smooth the audio data so no more than 4800 lines are drawn
        const smooth = Math.ceil(audioData.length / 2400)
        for (let i = 0; i < audioData.length; i += smooth) {
          ctx.beginPath()
          // Get the value of the audio data
          const value = audioData[i]

          // Calculate the x position of the line
          const x = i * (canvas.width / audioData.length)

          if (mousePositionX < timePositionX) {
            ctx.strokeStyle = x < mousePositionX
              ? colors[settings.color][3]
              : x < timePositionX
                ? colors[settings.color][6]
                : '#fff'
          } else {
            ctx.strokeStyle = x < timePositionX
              ? colors[settings.color][6]
              : x < mousePositionX
                ? colors[settings.color][3]
                : '#fff'
          }

          // Calculate the y position of the line
          const y = (canvas.height / 2) + (value * canvas.height)
          ctx.moveTo(x, canvas.height / 2)
          // Draw the line
          ctx.lineTo(x, y)
          ctx.stroke()
        }
      }
    }
    let mouseDown = false
    // function for scrubbing when clicking the mouse
    function scrub (event: MouseEvent): void {
      mouseDown = true
      if (canvasRef.current == null || buffer == null) {
        return
      }
      const rect = canvasRef.current.getBoundingClientRect()
      const x = (event.clientX - rect.left) * canvasRef.current.width / rect.width
      const time = x * buffer.duration / canvasRef.current.width
      onScrub(time)
    }

    function updateMousePosition (event: MouseEvent): void {
      if (canvasRef.current == null) {
        return
      }
      const rect = canvasRef.current.getBoundingClientRect()
      mousePositionX = (event.clientX - rect.left) * canvasRef.current.width / rect.width
      if (mouseDown) {
        scrub(event)
      }
      requestAnimationFrame(draw)
    }

    function clearMousePosition (): void {
      mousePositionX = 0
      mouseDown = false
      requestAnimationFrame(draw)
    }
    function clearMouseDown (): void {
      mouseDown = false
    }
    canvasRef.current.addEventListener('mousemove', updateMousePosition)
    canvasRef.current.addEventListener('mouseenter', updateMousePosition)
    canvasRef.current.addEventListener('mouseleave', clearMousePosition)
    canvasRef.current.addEventListener('mousedown', scrub)
    canvasRef.current.addEventListener('mouseup', clearMouseDown)

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      if (canvasRef.current == null) {
        return
      }
      canvasRef.current.removeEventListener('mousemove', updateMousePosition)
      canvasRef.current.removeEventListener('mouseenter', updateMousePosition)
      canvasRef.current.removeEventListener('mouseleave', clearMousePosition)
      canvasRef.current.removeEventListener('mousedown', scrub)
      canvasRef.current.removeEventListener('mouseup', clearMouseDown)
    }
  }, [file, buffer, settings.color, currentTime, playing, onScrub])

  return (
    <canvas className="scrubber-background" width="1200" height="100" style={{
      maxWidth: '85%',
      display: 'flex',
      flexShrink: 3
    }} ref={canvasRef} />
  )
}
