import './App.css'

import React, { useRef } from 'react'

import {
  Button,
  Group,
  MantineProvider
} from '@mantine/core'
import {
  IconFileMusic,
  IconMicrophone2,
  IconMicrophone2Off
} from '@tabler/icons'

// import {Adsense} from '@ctrl/react-adsense';

import {
  Analyze,
  AudioControls,
  AudioDropzone,
  AudioRecorder,
  GenderPrediction,
  Note,
  Settings
} from './components'
import {
  useInputAudio,
  useMediaStream
} from './contexts'
import { useSettingsStore, defaultSettings } from './store'
import { theme } from './utils/theme'

function App (): JSX.Element {
  const { stream, start, stop } = useMediaStream()
  const { loadFile, unloadFile, file } = useInputAudio()
  const { settings } = useSettingsStore()

  const toggleMic = async (): Promise<void> => {
    if (file != null) {
      await unloadFile()
    }
    if (stream != null) { stop() } else { await start() }
  }

  const openRef = useRef<() => void>(null)

  return (
    <MantineProvider theme={theme({...defaultSettings, ...settings})} withCSSVariables>
      <div className="App">
        <Settings />
        <Group position='center'>
          {(stream == null) && (
            <Button variant="outline" onClick={() => {
              if (openRef.current != null) {
                openRef.current()
              }
            }} leftIcon={<IconFileMusic />}
            >
              {(file != null) ? file.name : 'Open File'}
            </Button>
          )}
          <Button variant="outline" onClick={() => {
            toggleMic()
          }}
          leftIcon={(stream != null) ? <IconMicrophone2Off /> : <IconMicrophone2 />}
          >
            {(stream != null) ? 'Stop' : 'Start'} Mic
          </Button>
        </Group>
        {/* <AudioRecorder /> */}
        <AudioControls />
        <Analyze />
        <Note />
        <GenderPrediction />
        {/*<Adsense
          client="ca-pub-1567322254717202"
          slot="7259870550"
          style={{ display: 'block' }}
          layout="in-article"
          format="fluid"
        />*/}
        <AudioDropzone openRef={openRef} onFile={(file) => {
          void loadFile(file)
        }} />
      </div>
    </MantineProvider>
  )
}

export default App
