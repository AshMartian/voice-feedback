import { useModel } from 'react-tensorflow'
import { useState, useEffect } from 'react';
import { Text, Box, Button, Grid } from '@mantine/core';
import * as tf from '@tensorflow/tfjs';
import { useAudioAnalyser } from '../contexts/AudioAnalyserContext'
import useInterval from '../utils/useInterval';

export default function GenderPrediction() {
    const model = useModel({ modelUrl: `http://localhost:3000/model/model.json`, layers: true });
    const { analyser } = useAudioAnalyser();

    const [prediction, setPrediction] = useState<number>(0.50);
    const [predictionHistory, setPredictionHistory] = useState<number[]>([]);

    // const [lastFrequency, setLastFrequency] = useState<Number[]>([]);
    const [ averagedFrequencies, setAveragedFrequencies ] = useState<number[][]>([]); 
    const [ resetAverages, setResetAverages ] = useState<boolean>(false);
    const [ predictionCount, setPredictionCount ] = useState<number>(0);

    const addFrequency = (frequencies: number[]) => {
        setAveragedFrequencies([...averagedFrequencies, frequencies]);
    };

    const addPrediction = (prediction: number) => {
        setPredictionHistory((prev) => {
            const newPredictionHistory = [...prev, prediction];
            if(newPredictionHistory.length > 100) {
                newPredictionHistory.shift();
            }
            return newPredictionHistory;
        });
    };

    const clearAverageFrequencies = () => {
        setAveragedFrequencies([]);
        setResetAverages(true);
    };

    const purgePredictionHistory = (by: number) => {
        setPredictionHistory((prev) => {
            const newPredictionHistory = [...prev];
            newPredictionHistory.splice(0, by);
            return newPredictionHistory;
        });
    };


    useEffect(() => {
        if (!analyser) {
            return;
        }

        let raf: number;

        const data = new Uint8Array(analyser.frequencyBinCount);

        const draw = () => {
            raf = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(data);

            // convert frequencies from 1024 length float32 to 128 length float32
            let maxFreq = 0;
            const convertedFrequencies:number[] = [];
            /*for (let i = 0; i < 128; i++) {
                const start = i * 8;
                const end = start + 8;
                const avg = data.slice(start, end).reduce((a, b) => a + b) / 8;
                // convert avg to 0 - 10 from -100 - -10
                const min = 0;
                const max = 256;
                const converted = (avg - min) / (max - min) * 10;
                convertedFrequencies.push(converted);
                if (converted > maxFreq) {
                    maxFreq = converted;
                }
            }*/
            for (let i = 0; i < 128; i++) {
                const converted = (data[i] / 256) * 10;
                convertedFrequencies.push(converted);
            }

            if (resetAverages) {
                setResetAverages(false);
                return;
            }

            // Get current frame frequencies and average them with previous frames
            //if (maxFreq) {
                addFrequency(convertedFrequencies);
                // setLastFrequency(convertedFrequencies);
            //}
        };

        draw();

        return () => {
            cancelAnimationFrame(raf);
        }
    }, [analyser]);

    useInterval(async () => {
        if (averagedFrequencies && model && analyser) {
            const tensorData = tf.tensor2d(averagedFrequencies).mean(0).reshape([1, 128]);
            console.log(tensorData.dataSync());
            const prediction = model.predict(tensorData) as tf.Tensor<tf.Rank>;
            setPrediction(prediction.dataSync()[0]);
            addPrediction(prediction.dataSync()[0]);
            setPredictionCount(predictionCount + 1);
            if (predictionCount % 4 === 0) {
                setAveragedFrequencies(averagedFrequencies.slice(averagedFrequencies.length / 2));
            }
            //clearAverageFrequencies();
        } else {
            clearAverageFrequencies();
            setPrediction(0.5);
        }
    }, 2000);
        
    if (!analyser || !model || prediction === 0.5) {
        return null;
    }

    return (
        <div className='prediction'>
            <Text className='percent'>{prediction > 0.5 ? (prediction * 100).toFixed(2) : (100 - prediction * 100).toFixed(2)}%</Text>
            <Text className='gender' sx={{
                color: prediction > 0.5 ? '#ff6c85' : '#3f8cff'
            }}>{prediction > 0.5 ? 'Female' : 'Male'}</Text>
            <Box className='container' sx={{
                width: '100%',
                margin: '2em 0',
                height: '20vh',
                background: 'linear-gradient(90deg, #3f8cff 0%, #ffffff 50%, #ff6c85 100%)',
            }}>
                <Box className='handle' sx={{
                    position: 'absolute',
                    width: '2%',
                    transition: 'left 0.3s ease-in-out',
                    height: '20vh',
                    background: 'rgba(0, 0, 0, 0.5)',
                    left: `calc(${prediction * 100}% - 1%)`,
                }} />
                {predictionHistory.map((p, i) => (
                    <Box key={i} className='past-prediction' sx={{
                        position: 'absolute',
                        width: '2px',
                        height: '20vh',
                        background: 'rgba(0, 0, 0, 0.5)',
                        left: `${p * 100}%`
                    }} />
                ))}
            </Box>
            <Grid>
                <Grid.Col span={6}>
                    <Button onClick={clearAverageFrequencies}>Clear Average</Button>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Button color="pink" onClick={() => purgePredictionHistory(10)}>Purge History</Button>
                </Grid.Col>
            </Grid>
        </div>
    );
}
