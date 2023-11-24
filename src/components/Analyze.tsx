import {
  createRef,
  useEffect
} from 'react'

import { useAudioAnalyser } from '../contexts/AudioAnalyserContext'
import { MediaVerification } from './MediaVerification'

export const Analyze: React.FC = () => {
  const canvasRef = createRef<HTMLCanvasElement>()
  const { analyser, playing } = useAudioAnalyser()

  useEffect(() => {
    if (analyser == null) {
      return
    }

    let raf = 0
    const draw = (): void => {
      requestAnimationFrame(draw)
      if (!playing) {
        return
      }
      const currentTimeDomainData = new Uint8Array(analyser.fftSize)
      analyser.getByteTimeDomainData(currentTimeDomainData)
      const canvas = canvasRef.current
      // Check if the current Time data is full of 128s (silence)
      const isSilence = currentTimeDomainData.every((v) => v === 128)
      if (canvas != null && !isSilence) {
        const { height, width } = canvas
        const context = canvas.getContext('2d')
        let x = 0
        const sliceWidth = (width * 1.0) / currentTimeDomainData.length

        if (context != null) {
          context.lineWidth = 2
          context.strokeStyle = '#fff'
          // context.fillStyle = "rgba(255,255,255,0.2)";
          context.clearRect(0, 0, width, height)

          context.beginPath()
          context.moveTo(0, height / 2)
          for (const item of currentTimeDomainData) {
            const y = (item / 255.0) * height
            context.lineTo(x, y)
            x += sliceWidth
          }
          context.lineTo(x, height / 2)
          context.stroke()
        }
      }
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf) }
  }, [canvasRef, analyser])

  if (analyser == null) {
    return <MediaVerification />
  }

  return (
    <canvas className="waveform" width="1200" height="200" style={{
      maxWidth: '98vw',
      marginTop: '-4vw',
      marginBottom: '-4vw'
    }} ref={canvasRef} />
  )
}
