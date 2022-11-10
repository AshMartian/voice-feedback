import React, { createContext, FunctionComponent, useEffect, useState, useContext } from 'react';
import { useInputAudio } from './InputAudioContext';

interface AudioAnalyserContextValue {
  analyser: AnalyserNode | undefined;
}

const AudioAnalyserContext = createContext<AudioAnalyserContextValue>({
  analyser: undefined,
});

export const useAudioAnalyser = () => useContext(AudioAnalyserContext);

interface Props {
  children: React.ReactNode;
}

export const AudioAnalyserProvider: FunctionComponent<Props> = ({ children }) => {
  const [analyser, setAnalyser] = useState<AnalyserNode>();
  const { source } = useInputAudio();

  useEffect(() => {
    if (source) {
      const analyserNode = source.context.createAnalyser();
      analyserNode.smoothingTimeConstant = 0.4;
      analyserNode.maxDecibels = 0;
      analyserNode.minDecibels = -100;
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);
    }
  }, [source]);

  useEffect(() => {
    if (analyser && source) {
      source.connect(analyser);
    }

    if (!source) {
      if (analyser) {
        analyser.disconnect();
        setAnalyser(undefined);
      }
    }

    return () => {
      if (analyser) {
        analyser.disconnect();
        setAnalyser(undefined);
      }
    }
  }, [analyser, source])

  return (
    <AudioAnalyserContext.Provider value={{ analyser }}>
      {children}
    </AudioAnalyserContext.Provider>
  )
}

export default AudioAnalyserContext;