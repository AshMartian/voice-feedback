// const notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const A4 = 440;
const C0 = Math.round(A4 * Math.pow(2, -4.75)); // 16

interface calculateFrequencyOptions {
    rate?: number;
}

// Code by fritzvd (signaltohertz) - https://github.com/fritzvd/signaltohertz
// Changes: function name
const calculateFrequency = (frequencies: Float32Array, options: calculateFrequencyOptions = {}) => {
	const { rate = 22050 / 1024 } = options; // defaults in audioContext.

	let maxI = 0;
	let max = frequencies[0];

	for (let i = 0; frequencies.length > i; i++) {
		const oldmax = max;
		const newmax = Math.max(max, frequencies[i]);
		if (oldmax != newmax) {
			max = newmax;
			maxI = i;
		}
	}
	return maxI * rate;
};

// Calculate amount of steps away from C0
const calculateSemiTone = (frequency: number) => {
	const semiTonesAway = 12 * Math.log2(frequency / C0);
	return semiTonesAway;
};

// Uses C0 as base
const calculateOctave = (semiTonesAway: number) => {
	const octave = Math.floor(semiTonesAway / 12);
	return octave;
};

const calculateCents = (currentFrequency: number, lastFrequency: number) => {
	const cents = 1200 * Math.log2(lastFrequency / currentFrequency);
	return cents;
};

const calculateNote = (frequency: number) => {
	const semiTone = calculateSemiTone(frequency);
	const octave = calculateOctave(semiTone);
	const notePosition = Math.floor(semiTone % 12);
	const note = notes[notePosition] + String(octave);
	return note;
};

const toDecimals = (number: number, decimals: number) => {
	const fixedNumber = number.toFixed(decimals);
	return fixedNumber;
};

// Handle error
const throwError = (err: string) => {
	throw new Error(`Something went wrong: ${err}`);
};

const logError = (err: string) => {
	console.error(err);
};

export {
	calculateFrequency,
	calculateSemiTone,
	calculateCents,
	calculateNote,
	toDecimals,
	throwError,
	logError,
};