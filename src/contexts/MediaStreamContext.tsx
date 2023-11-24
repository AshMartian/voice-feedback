import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

interface MediaStreamContextValue {
  stream: MediaStream | undefined
  start: () => Promise<void>
  stop: () => void
}

const MediaStreamContext = createContext<MediaStreamContextValue>({
  stream: undefined,
  start: async () => { await Promise.resolve() },
  stop: () => { console.warn('stop not implemented') }
})

export const useMediaStream = (): MediaStreamContextValue => useContext(MediaStreamContext)

interface Props {
  audio: boolean
  video: boolean
  children: React.ReactNode
}
export const MediaStreamProvider: FunctionComponent<Props> = ({ children, audio, video }) => {
  const [stream, setStream] = useState<MediaStream>()

  useEffect(() => {
    return () => {
      if (stream != null) {
        stream.getTracks().forEach(track => { track.stop() })
      }
    }
  }, [stream])

  const start = useCallback(async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio, video })
    setStream(mediaStream)
  }, [audio, video])

  const stop = useCallback(() => {
    if (stream != null) {
      stream.getTracks().forEach(track => { track.stop() })
      setStream(undefined)
    }
  }, [stream])

  return (
    <MediaStreamContext.Provider value={{ stream, start, stop }}>
      {children}
    </MediaStreamContext.Provider>
  )
}

export default MediaStreamContext
