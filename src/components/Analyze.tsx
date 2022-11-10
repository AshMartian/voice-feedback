import {FC, createRef, useEffect } from "react";
import MediaVerification from "./MediaVerification";
import { useAudioAnalyser } from '../contexts/AudioAnalyserContext';


const Analyze: React.FC = () => {
    const canvasRef = createRef<HTMLCanvasElement>();
    const { analyser } = useAudioAnalyser();
  
    useEffect(() => {
      if (!analyser) {
        console.log("No analyzer")
        return;
      }
  
      let raf: number;
  
      const data = new Uint8Array(analyser.frequencyBinCount);
  
      const draw = () => {
        raf = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(data);
        const canvas = canvasRef.current;
        if (canvas) {
          const { height, width } = canvas;
          const context = canvas.getContext('2d');
          let x = 0;
          const sliceWidth = (width * 1.0) / data.length;
  
          if (context) {
            context.lineWidth = 2;
            context.strokeStyle = '#fff';
            // context.fillStyle = "rgba(255,255,255,0.2)";
            context.clearRect(0, 0, width, height);
  
            context.beginPath();
            context.moveTo(0, height / 2);
            for (const item of data) {
              const y = (item / 255.0) * height;
              context.lineTo(x, y);
              x += sliceWidth;
            }
            context.lineTo(x, height / 2);
            context.stroke();
          }
        }
      };
      draw();
  
  
      return () => {
        cancelAnimationFrame(raf);
      }
    }, [canvasRef, analyser]);
  
    if (!analyser) {
      return <MediaVerification />;
    }

    return (
        <canvas className="waveform" width="1200" height="200" ref={canvasRef} />
    );
};

export default Analyze;
