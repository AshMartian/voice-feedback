import React, { FC, useEffect, useState, useRef } from 'react';
import { useAudioAnalyser } from '../contexts/AudioAnalyserContext';
import { useSettingsStore } from '../store';
import { calculateFrequency, toDecimals } from '../utils/sound';

export const Note: FC = () => {
  const { analyser, meyda } = useAudioAnalyser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings } = useSettingsStore();
  const notes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

  const drawBarChart = (ctx: CanvasRenderingContext2D, chroma: number[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const barWidth = ctx.canvas.width / chroma.length;
    const maxValue = Math.max(...chroma);
    const maxIndex = chroma.indexOf(maxValue);
    const heightScale = ctx.canvas.height / maxValue;

    chroma.forEach((value, index) => {
      const x = barWidth * index;
      const y = ctx.canvas.height - value * heightScale;
      const height = value * heightScale;
      ctx.fillStyle = index === maxIndex ? settings.color : 'white';
      ctx.fillRect(x, y, barWidth - 2, height);
      ctx.fillStyle = 'black';
      ctx.font = '36px Arial';
      ctx.fillText(notes[index], (x + barWidth / 2) - 12, ctx.canvas.height - 5);
    });
  };

  useEffect(() => {
    if (analyser == undefined || meyda == undefined || !settings.showNote) {
      return;
    }
    const ctx = canvasRef.current!.getContext('2d')!;
    let raf = 0;

    const draw = () => {
      requestAnimationFrame(draw);

      const chromaFeatures = meyda.get(['chroma']);
      if (chromaFeatures != null && chromaFeatures.chroma != null) {
        drawBarChart(ctx, chromaFeatures.chroma);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [analyser, settings.showNote, settings.color]);

  if (analyser == null || !settings.showNote) {
    return null;
  }

  return (
    <div>
      <canvas ref={canvasRef} width="1200" height="200" style={{
        maxWidth: '98vw',
        transform: 'scale(0.5)',
      }}></canvas>
    </div>
  );
};
