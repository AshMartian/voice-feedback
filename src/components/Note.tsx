import {FC, useState, useEffect } from "react";
import { Text } from '@mantine/core';
import { useAudioAnalyser } from '../contexts/AudioAnalyserContext';
import { calculateFrequency, calculateNote, toDecimals } from "../utils/sound";

const Note: FC = () => {
    const { analyser } = useAudioAnalyser();
    const [lastFrequency, setLastFrequency] = useState("");
    const [note, setNote] = useState("");
  
    useEffect(() => {
      if (!analyser) {
        return;
      }
      
      let raf: number;

      const data = new Float32Array(analyser.frequencyBinCount);

      const draw = () => {
        raf = requestAnimationFrame(draw);
        analyser.getFloatFrequencyData(data);

        const frequency = calculateFrequency(data);

        if (frequency && frequency < 1100) {

          setNote(calculateNote(frequency) || "");

          setLastFrequency(toDecimals(frequency, 1));

        }
      };
      draw();

      return () => {
        cancelAnimationFrame(raf);
      }
  
    }, [analyser]);

    if (!analyser || !note || note === 'undefined-Infinity') {
        return null;
    }
    return (
      <>
        <Text className="note">{note}</Text>
        <Text className="frequency">{lastFrequency} Hz</Text>
      </>
    );
};

export default Note;