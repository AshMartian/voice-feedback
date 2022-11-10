import { Button, createStyles } from '@mantine/core';
import Analyze from './components/Analyze'
import { useMediaStream } from './contexts/MediaStreamContext'
import './App.css'
import Note from './components/Note';
import GenderPrediction from './components/GenderPrediction';

const useStyles = createStyles(() => ({
  button: {
    borderRadius: '8px',
    border: '1px solid transparent',
    padding: '0.6em 1.2em',
    fontWeight: 500,
    fontFamily: 'inherit',
    backgroundColor: '#1a1a1a',
    cursor: 'pointer',
    transition: 'border-color 0.25s',
  },
}));

function App() {

  const { stream, start, stop } = useMediaStream();

  const toggleMic = () => stream ? stop() : start();

  const { classes } = useStyles();

  return (
    <div className="App">
      <Button className={classes.button} onClick={toggleMic}>{stream ? 'Stop' : 'Start'} Mic</Button>
      <Analyze />
      <Note />
      <GenderPrediction />
    </div>
  )
}

export default App
