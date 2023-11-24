import {
  useCallback,
  useEffect,
  useState
} from 'react'

import {
  Box,
  Button,
  Grid,
  Text
} from '@mantine/core'

import { useRealtimePrediction } from '~/utils/useRealtimePrediction'

import { useSettingsStore } from '~/store';

export function GenderPrediction (): JSX.Element | null {
  const [prediction, setPrediction] = useState<number>(0.5);
  const [predictionHistory, setPredictionHistory] = useState<number[]>([]);
  const { settings } = useSettingsStore();

  const addPrediction = useCallback(
    (prediction: number) => {
      const newPredictionHistory = [prediction, ...predictionHistory];
      if (newPredictionHistory.length > 125) {
        newPredictionHistory.pop();
      }
      setPredictionHistory(newPredictionHistory);
      return newPredictionHistory;
    },
    [predictionHistory]
  );

  const { model, clearBuffer } = useRealtimePrediction({
    predictCallback: (prediction: number) => {
      setPrediction(prediction)
      if (!predictionHistory.includes(prediction)) {
        addPrediction(prediction)
      }
    }
  })

  const purgePredictionHistory = useCallback((numberToRemove: number) => {
    const newPredictionHistory = predictionHistory.slice(0, numberToRemove);
    setPredictionHistory(newPredictionHistory);
  }, [predictionHistory]);

  return (
    <div className='prediction'>
      {model == null && (
        <div className='loading'>
          <Text className='loading-text'>Loading model...</Text>
        </div>
      )}
      {(model != null) && prediction !== 0.5 && (
        <>
          <Grid>
            <Grid.Col span={6}>
              <Button color="blue" onClick={() => clearBuffer()}>Clear Buffer</Button>
            </Grid.Col>
            <Grid.Col span={6}>
              <Button color="pink" onClick={() => { purgePredictionHistory(10) }}>Purge History</Button>
            </Grid.Col>
          </Grid>
          <Text className='percent'>
            {prediction > 0.5 ? (prediction * 100).toFixed(2) : (100 - prediction * 100).toFixed(2)}%
          </Text>
          <Text className='gender' sx={{
            color: prediction > 0.62 ? '#ff6c85' : prediction < 0.38 ? '#3f8cff' : 'white'
          }}>
            {prediction > 0.62 && 'Female'}
            {prediction < 0.38 && 'Male'}
            {prediction > 0.38 && prediction < 0.62 && 'Neutral'}
          </Text>
          <Box className='container' sx={{
            width: '100%',
            margin: '2em 0',
            height: '20vh',
            background: 'linear-gradient(90deg, #3f8cff 10%, #ffffff 50%, #ff6c85 90%)'
          }}>
            <Box className='handle' sx={{
              position: 'absolute',
              width: '2%',
              transition: 'left 0.3s ease-in-out',
              height: '20vh',
              background: 'rgba(0, 0, 0, 0.5)',
              left: `calc(${prediction * 100}% - 1%)`
            }} />
            {predictionHistory.map((p) => (
              p !== 0
                ? <Box key={`prediction-${p}`} className='past-prediction' sx={{
                  position: 'absolute',
                  width: '2px',
                  height: '20vh',
                  background: 'rgba(0, 0, 0, 0.5)',
                  left: `${p * 100}%`
                }} />
                : null
            ))}
          </Box>
        </>
      )}
    </div>
  )
}
