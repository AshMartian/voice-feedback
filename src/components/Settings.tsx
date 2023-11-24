import { useState } from 'react'

import {
  Button,
  Divider,
  Modal,
  SegmentedControl,
  Slider,
  Stack,
  Switch,
  Text
} from '@mantine/core'
import { IconSettings } from '@tabler/icons'

import {
  SettingsInterface,
  useSettingsStore
} from '../store'

export const Settings: React.FC = () => {
  const { settings, setSettings, resetSettings } = useSettingsStore()

  const [showDialog, setShowDialog] = useState(false)

  const handleSettingsChange = (key: keyof SettingsInterface, value: string | number | boolean): void => {
    const newSetting: Partial<SettingsInterface> = { [key]: value }
    setSettings(newSetting)
  }

  const valueLabelFormat = (value: number): string => {
    return `${value.toFixed(1)}s`
  }

  const valueLabelFormatMS = (value: number): string => {
    return `${value.toFixed(1)}ms`
  }

  return (
    <>
      <Button
        variant="subtle"
        color="gray"
        onClick={() => { setShowDialog(true) }}
        style={{ position: 'absolute', top: '5px', right: '5px' }}
      >
        <IconSettings />
      </Button>
      <Modal
        title={(<Text sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}><IconSettings /> Settings</Text>)}
        opened={showDialog}
        onClose={() => { setShowDialog(false) }}
        size="sm"
        centered
      >
        <Stack spacing="xs" align="stretch">
          <Text>Color</Text>
          <SegmentedControl
            value={settings.color}
            onChange={(value) => {
              handleSettingsChange('color', value)
            }}
            data={[
              { label: 'Blue', value: 'blue' },
              { label: 'Green', value: 'green' },
              { label: 'Gold', value: 'yellow' },
              { label: 'Purple', value: 'violet' },
              { label: 'Pink', value: 'pink' }
            ]}
          />
          <Divider />
          <Text>Scrubber Preview</Text>
          <Switch
            label={settings.scrubberPreview ? 'Will preview the audio loaded' : 'Scrubber will be quiet'}
            checked={settings.scrubberPreview}
            color={settings.color}
            onChange={(value) => {
              handleSettingsChange('scrubberPreview', value.target.checked)
            }}
          />
          <Divider />
          {settings.scrubberPreview && (
            <>
              <Text>Scrubber Preview Duration</Text>
              <Slider
                value={settings.scrubberPreviewSize}
                color={settings.color}
                min={0.1}
                max={2}
                step={0.1}
                label={valueLabelFormat}
                onChange={(value) => {
                  handleSettingsChange('scrubberPreviewSize', value)
                }}
              />
              <Divider />
            </>
          )}
          <Text>Show Note</Text>
          <Switch
            label={settings.showNote ? 'Will show note and frequency (Hz)' : 'Off'}
            checked={settings.showNote}
            color={settings.color}
            onChange={(value) => {
              handleSettingsChange('showNote', value.target.checked)
            }}
          />
          <Divider />
          <Text>Prediction Buffer</Text>
          <Slider
            value={settings.predictionBuffer}
            color={settings.color}
            min={64}
            max={512}
            step={64}
            onChange={(value) => {
              handleSettingsChange('predictionBuffer', value)
            }}
          />
          <Divider />
          <Text>Prediction Interval</Text>
          <Slider
            value={settings.predictionInterval}
            color={settings.color}
            min={400}
            max={5000}
            step={100}
            onChange={(value) => {
              handleSettingsChange('predictionInterval', value)
            }}
            label={valueLabelFormatMS}
          />

          <Divider />
          <Button
            variant="outline"
            color={settings.color}
            onClick={() => {
              resetSettings()
            }}
          >
            Reset Settings
          </Button>
        </Stack>
      </Modal>
    </>
  )
}
