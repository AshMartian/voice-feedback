import { useState, useCallback, useRef, useEffect } from 'react'

import {
  Button,
  Group,
  Tooltip
} from '@mantine/core'
import {
  IconPlayerRecord,
  IconPlayerStop
} from '@tabler/icons'

import {
  useInputAudio,
  useMediaStream
} from '../contexts'

import * as Lame from 'lamejstmp'

export const AudioRecorder = (): JSX.Element => {
  const { file, loadFile } = useInputAudio()
  const { stream, stop } = useMediaStream()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSavable, setRecordingSavable] = useState(false)

  const chunks = useRef<Int16Array>();
  const mediaRecorder = useRef<MediaRecorder>();

  const handleStartRecording = useCallback(() => {
    if (!stream) {
      return () => {};
    }

    setIsRecording(true);
    // chunks.current = [];
    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.addEventListener('dataavailable', (event) => {
      chunks.current = new Int16Array(event.data);
      setRecordingSavable(true);
    });

    mediaRecorder.current.start();

    return handleStopRecording;
  }, [stream]);

  const handleStopRecording = useCallback(() => {
    if (!stream || !mediaRecorder.current) {
      return;
    }
    mediaRecorder.current.stop();
    setIsRecording(false);

  }, [stream, setRecordingSavable]);

  useEffect(() => {
    if (!recordingSavable) {
      return;
    }
    stop();
    console.log(chunks.current)

    // Convert the recorded audio to MP3 using LameJS
    const sampleRate = 48000;
    const numChannels = 1;
    const gain = 100;

    const encoder = new Lame.Mp3Encoder(numChannels, sampleRate, 128);
    const mp3Data = [];

    const mp3buf = encoder.encodeBuffer(chunks.current);

    mp3Data.push(mp3buf);

    // Get end part of mp3
   const mp3Tmp = encoder.flush();

    // Write last data to the output data, too
    // mp3Data contains now the complete mp3Data
    mp3Data.push(mp3Tmp);

    const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
    const mp3File = new File([mp3Blob], 'recording.mp3', { type: 'audio/mp3' });
    loadFile(mp3File);

    // Download the MP3 file
    const mp3Url = URL.createObjectURL(mp3Blob);
    const mp3Link = document.createElement('a');
    mp3Link.href = mp3Url;
    mp3Link.download = 'recording.mp3';
    document.body.appendChild(mp3Link);
    mp3Link.click();
    document.body.removeChild(mp3Link);

    chunks.current = [];
    setRecordingSavable(false);
  }, [recordingSavable]);

  if (file != null) {
    return <></>
  }
  
  return (
    <Group dir="row" sx={{
      padding: '2em 1em',
      width: '100%',
      maxWidth: '98vw',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {(file == null) && (stream != null) && (
      <Tooltip label={isRecording ? 'Stop Recording' : 'Start Recording'}>
        <Button color="red" variant={isRecording ? 'outline' : 'filled'} onClick={() => {
          if (isRecording) {
            handleStopRecording();
          } else {
            handleStartRecording();
          }
        }}>
          {isRecording ? <IconPlayerStop /> : <IconPlayerRecord /> }
        </Button>
      </Tooltip>
      )}
    </Group>
  )
}
