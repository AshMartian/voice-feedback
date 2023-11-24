import {
  useCallback,
  useState
} from 'react'

import {
  Button,
  Group
} from '@mantine/core'
import {
  IconPlayerPause,
  IconPlayerPlay
} from '@tabler/icons'

import { useInputAudio } from '../contexts'
import { useSettingsStore } from '../store'
import useInterval from '../utils/useInterval'
import { AudioScrubber } from './AudioScrubber'

export const AudioControls = (): JSX.Element => {
  const { buffer, audioCtx, file, scrubFile, playFile, pauseFile, playing } = useInputAudio()
  const { settings } = useSettingsStore()
  const [playTime, setPlayTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [scrubbing, setScrubbing] = useState(false)

  const play = useCallback(() => {
    if (audioCtx != null) {
      setPlayTime(Date.now() - (currentTime * 1000))
      playFile(currentTime)
    } else {
      console.error('No audio context')
    }
  }, [audioCtx, currentTime])

  const pause = useCallback(() => {
    if (audioCtx != null) {
      pauseFile()
    }
  }, [audioCtx])

  const handleSliderChange = useCallback((value: number) => {
    setScrubbing(true)
    setCurrentTime(value)
    setPlayTime(Date.now() - (value * 1000))
    console.log('handleSliderChange', value, playing)
    if (settings.scrubberPreview) {
      scrubFile(value, playing, settings.scrubberPreviewSize)
    }
  }, [playing, settings.scrubberPreview, settings.scrubberPreviewSize, scrubFile])

  useInterval(() => {
    if (playing && !scrubbing && buffer !== undefined) {
      const newCurrentTime = (Date.now() - playTime) / 1000
      setCurrentTime(newCurrentTime)
      const duration = buffer.duration
      if (duration !== undefined && newCurrentTime >= duration) {
        pause()
        scrubFile(0, playing, 0)
        setCurrentTime(0)
      }
    }
  }, 100)

  if (file == null) {
    return <></>
  }

  return (
    <Group dir="row" sx={{
      padding: '2em 1em',
      width: '100%',
      flexWrap: 'nowrap',
      maxWidth: '98vw',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {!playing && (
        <Button color={settings.color} onClick={play}><IconPlayerPlay /></Button>
      )}
      {playing && (
        <Button color={settings.color} onClick={pause}><IconPlayerPause /></Button>
      )}
      {/* (file != null) && (
        <Slider
          value={currentTime}
          min={0}
          step={0.01}
          thumbSize={20}
          sx={{
            flexGrow: 2
          }}
          color={settings.color}
          labelAlwaysOn
          onChange={(number) => { handleSliderChange(number) }}
          onChangeEnd={() => {
            setScrubbing(false)
            if (playing) {
              play()
            }
          }}
          label={valueLabelFormat}
          max={buffer?.duration ?? 0}
        />
        ) */}
      <AudioScrubber currentTime={currentTime} onScrub={handleSliderChange} />
    </Group>
  )
}
