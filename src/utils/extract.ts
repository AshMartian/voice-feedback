import * as tf from '@tensorflow/tfjs';

export interface Features {
  mfcc: number[][];
  spectralCentroid: number[];
  spectralFlatness: number[];
  spectralSlope: number[];
  spectralKurtosis: number[];
  chroma: number[][];
}

export function extract(features: Features, coefficients: number = 40) {
  const mfccTensor = tf.tensor2d(features.mfcc);
  const mfccMean = mfccTensor.mean(0).reshape([1, coefficients]);
  const spectralCentroidTensor = tf.tensor(features.spectralCentroid);
  const spectralCentroidMean = spectralCentroidTensor.mean(0).reshape([1, 1]);
  const spectralFlatnessTensor = tf.tensor(features.spectralFlatness);
  const spectralFlatnessMean = spectralFlatnessTensor.mean(0).reshape([1, 1]);
  const spectralSlopeTensor = tf.tensor(features.spectralSlope);
  const spectralSlopeMean = spectralSlopeTensor.mean(0).reshape([1, 1]);
  const spectralKurtosisTensor = tf.tensor(features.spectralKurtosis);
  const spectralKurtosisMean = spectralKurtosisTensor.mean(0).reshape([1, 1]);
  const chromaTensor = tf.tensor2d(features.chroma);
  const chromaMean = chromaTensor.mean(0).reshape([1, 12]);

  // Concatenate the mean values of all features into a single tensor
  const combinedMean = tf.concat([mfccMean, chromaMean, spectralCentroidMean, spectralFlatnessMean, spectralKurtosisMean, spectralSlopeMean], 1);

  return combinedMean;
}