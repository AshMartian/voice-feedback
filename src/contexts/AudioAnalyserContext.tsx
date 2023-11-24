import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import Meyda from 'meyda';

import { useInputAudio } from './InputAudioContext'

interface AudioAnalyserContextValue {
  analyser: AnalyserNode | undefined
  playing: boolean
  meyda: Meyda.MeydaAnalyzer | undefined
  subscribe: (callback: (features: Meyda.MeydaFeaturesObject) => void) => void
}

const AudioAnalyserContext = createContext<AudioAnalyserContextValue>({
  analyser: undefined,
  playing: false,
  meyda: undefined,
  subscribe: () => {},
})

export const useAudioAnalyser = (): AudioAnalyserContextValue => useContext(AudioAnalyserContext)

interface Props {
  children: React.ReactNode
}

export const AudioAnalyserProvider: FunctionComponent<Props> = ({ children }) => {
  const [analyser, setAnalyser] = useState<AnalyserNode>()
  const { source, audioCtx, playing } = useInputAudio()
  const [meyda, setMeyda] = useState<Meyda.MeydaAnalyzer>()
  const [callbacks, setCallbacks] = useState<((features: Meyda.MeydaFeaturesObject) => void)[]>([]);

  useEffect(() => {
    if (audioCtx != null) {
      const analyserNode = audioCtx.createAnalyser()
      analyserNode.smoothingTimeConstant = 0.1
      // analyserNode.maxDecibels = -30
      // analyserNode.minDecibels = -80
      analyserNode.fftSize = 2048
      if (source != null) {
        source.connect(analyserNode)
      }
      setAnalyser(analyserNode)
    }
  }, [audioCtx])

  /*useEffect(() => {
    if ((analyser != null) && (source != null)) {
      source.connect(analyser)
    }

    if (source == null) {
      if (analyser != null) {
        analyser.disconnect()
        // setAnalyser(undefined)
      }
    }
  }, [analyser, source])*/

  const subscribe = useCallback(
    (callback: (features: Meyda.MeydaFeaturesObject) => void) => {
      setCallbacks((prevState) => [...prevState, callback]);
      return () => {
        setCallbacks((prevState) => prevState.filter((cb) => cb !== callback));
      };
    },
    []
  );

  useEffect(() => {
    let meydaAnalyzer: Meyda.MeydaAnalyzer | undefined = undefined;

    console.log("have callbacks ", callbacks);

    if (audioCtx !== undefined && audioCtx.state === 'running' && source !== undefined && callbacks.length > 0) {
      Meyda.numberOfMFCCCoefficients = 40;
      Meyda.melBands = 40;
      Meyda.sampleRate = audioCtx.sampleRate;
      const bufferSize = 512;

      meydaAnalyzer = Meyda.createMeydaAnalyzer({
        audioContext: audioCtx,
        source: source,
        bufferSize,
        featureExtractors: [
          'mfcc',
          'spectralCentroid',
          'spectralFlatness',
          'spectralSlope',
          'spectralKurtosis',
          'chroma',
          'loudness',
        ],
        callback: (newFeatures: Meyda.MeydaFeaturesObject) => {
          callbacks.forEach((callback) => {
            callback(newFeatures);
          });
        },
      });
      meydaAnalyzer.start();
      console.log("Set meyda");
    } else {
      console.log("Not setting meyda ", audioCtx, source, callbacks.length > 0);
    }

    setMeyda(meydaAnalyzer);


    return () => {
      if (meydaAnalyzer) {
        meydaAnalyzer.stop();
      }
    };
  }, [audioCtx, source, callbacks]);

  return (
    <AudioAnalyserContext.Provider value={{ analyser, playing, subscribe, meyda }}>
      {children}
    </AudioAnalyserContext.Provider>
  )
}

export default AudioAnalyserContext
