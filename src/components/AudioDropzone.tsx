import {
  Group,
  Text
} from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import {
  IconFileMusic,
  IconUpload,
  IconX
} from '@tabler/icons'

interface AudioDropzoneProps {
  onFile: (file: File) => void
  openRef: React.RefObject<() => void>
}

export function AudioDropzone (props: AudioDropzoneProps): JSX.Element {
  const { onFile, openRef } = props

  return (
    <Dropzone.FullScreen
      openRef={openRef}
      multiple={false}
      accept={[
        'audio/x-mp3',
        'audio/mpeg',
        'audio/mp3',
        'audio/x-m4a',
        'audio/aac',
        'audio/wav',
        'audio/x-wav',
        'audio/webm',
        'audio/ogg',
        'audio/x-ogg',
        'audio/opus',
        'audio/x-opus'
      ]}
      onDrop={(files) => {
        console.log(files)
        onFile(files[0])
      }}
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        '.mantine-Dropzone-root': {
          '&:hover': {
            backgroundColor: 'rgba(126, 126, 126, 0.5)'
          },
          '&[data-accept]': {
            backgroundColor: 'rgba(0, 64, 126, 0.5)'
          },
          '&[data-reject]': {
            backgroundColor: 'rgba(255, 0, 0, 0.5)'
          },
          '&[data-idle]': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }

      }}
    >
      <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload
            size={50}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            size={50}
            stroke={1.5}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconFileMusic size={50} stroke={1.5} />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag images here or click to select files
          </Text>
        </div>
      </Group>
    </Dropzone.FullScreen>
  )
}
