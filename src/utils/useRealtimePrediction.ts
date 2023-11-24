import useInterval from './useInterval'
import { useCallback, useEffect, useRef } from 'react'
import { useAudioAnalyser } from '~/contexts'
import { useModel } from 'react-tensorflow'
import * as tf from '@tensorflow/tfjs'
import { useSettingsStore } from '~/store'

type PredictCallback = (prediction: number) => void

type UseRealtimePredictionOptions = {
  predictCallback: PredictCallback
}

export const useRealtimePrediction = (options: UseRealtimePredictionOptions) => {
  const { predictCallback } = options

  const { meyda, subscribe, playing } = useAudioAnalyser()
  const model = useModel({ modelUrl: `${window.location.href}model/model.json`, layers: true })
  const features = useRef<number[][]>([])
  const settings = useSettingsStore(state => state.settings)

  const clearBuffer = useCallback(() => {
    features.current = []
  }, [])

  const predict = useInterval(() => {
    if (model != null && features.current.length >= 10) {
      const featuresTensor = tf.stack([features.current], 0)

      const prediction: tf.Tensor<tf.Rank> | undefined = model.predict(featuresTensor) as tf.Tensor<tf.Rank>
      const parsedPrediction = 1 - prediction.dataSync()[0] ?? undefined

      if (
        prediction !== undefined &&
        parsedPrediction !== undefined &&
        !isNaN(parsedPrediction)
      ) {
        predictCallback(parsedPrediction)
      }
    }
  }, settings.predictionInterval)

  const gotNewFeatures = useCallback((newFeatures: Meyda.MeydaFeaturesObject) => {
    if (newFeatures.loudness.total >= 10) {
      let featureTensor = [
        ...newFeatures.mfcc,
        ...newFeatures.chroma,
        newFeatures.spectralCentroid / (512 / 2),
        newFeatures.spectralFlatness,
        newFeatures.spectralSlope,
        newFeatures.spectralKurtosis
      ]
      features.current = [...features.current.slice(-settings.predictionBuffer), [...featureTensor]]
    }
  }, [])

  useEffect(() => {
    subscribe(gotNewFeatures)
  }, [gotNewFeatures])

  return {
    model,
    clearBuffer,
  }
}
