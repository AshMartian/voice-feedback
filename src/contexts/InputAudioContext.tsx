import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import { useSettingsStore } from '../store'
import { useMediaStream } from './MediaStreamContext'

interface InputAudioContextValue {
  audioCtx: AudioContext | undefined
  source: AudioNode | undefined
  buffer: AudioBuffer | undefined
  loadFile: (file: File) => Promise<void>
  unloadFile: () => Promise<void>
  playFile: (startTime: number) => void
  pauseFile: () => void
  playing: boolean
  scrubFile: (time: number, isPlaying: boolean, scrubSize: number) => void
  file: File | undefined
}

const InputAudioContext = createContext<InputAudioContextValue>({
  audioCtx: undefined,
  source: undefined,
  buffer: undefined,
  loadFile: async () => { await Promise.resolve() },
  unloadFile: async () => { await Promise.resolve() },
  scrubFile: () => { console.warn('scrubFile not implemented') },
  playFile: () => { console.warn('playFile not implemented') },
  playing: false,
  pauseFile: () => { console.warn('pauseFile not implemented') },
  file: undefined
})

export const useInputAudio = (): InputAudioContextValue => useContext(InputAudioContext)

interface Props {
  children: React.ReactNode
}

export const InputAudioProvider: FunctionComponent<Props> = ({ children }) => {
  const [context, setContext] = useState<AudioContext>()
  const [source, setSource] = useState<MediaStreamAudioSourceNode | AudioBufferSourceNode>()
  const [buffer, setBuffer] = useState<AudioBuffer>()
  const [file, setFile] = useState<File>()
  const [playing, setPlaying] = useState(false)
  const scrubTimeout = useRef<NodeJS.Timeout>()
  const { stream } = useMediaStream()
  const { settings } = useSettingsStore()

  const stop = useCallback(async () => {
    try {
      if (file != undefined) {
        setFile(undefined)
      }
      if (context != undefined) {
        if (context.state === 'running') {
          await context.close()
        }
        setContext(undefined)
      }
      if (source != undefined) {
        source.disconnect()
        setSource(undefined)
      }
    } catch (e) {
      setSource(undefined)
      setContext(undefined)
      setFile(undefined)
      const error = e as Error
      console.error(error.name, error.message)
    }
  }, [context, source])

  const loadFile = useCallback(async (file: File) => {
    try {
      setFile(file)
      const audioCtx = new AudioContext()
      const audioBuffer = await audioCtx.decodeAudioData(await file.arrayBuffer())
      audioCtx.createBufferSource()
      setContext(audioCtx)
      setBuffer(audioBuffer)
      setPlaying(false)
    } catch (e) {
      const error = e as Error
      console.error(error.name, error.message)
    }
  }, [context, source])

  const unloadFile = useCallback(async () => {
    try {
      if (file != null) {
        setFile(undefined)
      }
      if (context != null) {
        if (context.state === 'running') {
          await context.close()
        }
        setContext(undefined)
      }
      if (source != null) {
        source.disconnect()
        setSource(undefined)
      }
      if (buffer != null) {
        setBuffer(undefined)
      }
    } catch (e) {
      const error = e as Error
      console.error(error.name, error.message)
    }
  }, [context, source])

  const playFile = useCallback((startTime = 0) => {
    try {
      if ((context !== undefined) && (buffer !== undefined)) {
        setSource((oldSource) => {
          if (oldSource != null) {
            (oldSource as AudioBufferSourceNode).stop()
          }
          const newSource = context.createBufferSource()
          newSource.buffer = buffer
          newSource.connect(context.destination)
          newSource.start(0, startTime)
          void context.resume()
          return newSource
        })
        setPlaying(true)
      }
    } catch (e) {
      const error = e as Error
      console.error(error.name, error.message)
    }
  }, [context, setSource])

  const pauseFile = useCallback(() => {
    try {
      if ((context !== undefined)) {
        setSource((oldSource) => {
          if (oldSource != null) {
            (oldSource as AudioBufferSourceNode).stop()
            oldSource.disconnect()
            void context.suspend()
          }
          return undefined
        })
        setPlaying(false)
      }
    } catch (e) {
      const error = e as Error
      console.error(error.name, error.message)
    }
  }, [context, setSource])

  const scrubFile = useCallback((time: number, isPlaying = false, scrubSize = 0.3) => {
    try {
      if ((context !== undefined) && (buffer !== undefined) && scrubTimeout.current == null) {
        if (source != null) {
          (source as AudioBufferSourceNode).stop()
          source.disconnect()
        }
        const newSource = context.createBufferSource()
        newSource.buffer = buffer
        newSource.connect(context.destination)
        newSource.start(
          0,
          Math.max(time - (scrubSize / 2), 0),
          isPlaying ? undefined : scrubSize
        )
        console.log('scrub', time, scrubSize, isPlaying)
        void context.resume()
        const shouldPause = !isPlaying
        if (shouldPause) {
          setPlaying(true)
          scrubTimeout.current = setTimeout(() => {
            pauseFile()
            newSource.stop()
            newSource.disconnect()
            scrubTimeout.current = undefined
          }, settings.scrubberPreviewSize * 1000)
        }
        setSource(newSource)
      }
    } catch (e) {
      const error = e as Error
      console.error(error.name, error.message)
    }
  }, [context, source, setSource, settings.scrubberPreviewSize, playing, pauseFile, scrubTimeout.current])

  useEffect(() => {
    try {
      if (context != null) {
        if (context.state === 'running') {
          void context.close()
        }
        setContext(undefined)
      }
      if (stream != null) {
        const audioCtx = new AudioContext()
        setSource(audioCtx.createMediaStreamSource(stream))
        setContext(audioCtx)
        setPlaying(true)
      }
    } catch (e) {
      const error = e as Error
      console.error(error.name, error.message)
    }
  }, [stream])

  useEffect(() => {
    if ((stream === undefined) && (file === undefined)) {
      void stop()
    }

    return () => {
      if (file === undefined) {
        void stop()
      }
    }
  }, [stream, stop, file])

  return (
    <InputAudioContext.Provider value={{
      audioCtx: context,
      source,
      buffer,
      loadFile,
      unloadFile,
      playFile,
      pauseFile,
      playing,
      scrubFile,
      file
    }}>
      {children}
    </InputAudioContext.Provider>
  )
}

export default InputAudioContext
