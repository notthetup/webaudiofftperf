# webaudiofftperf
WebAudio FFT Performance Test

## Aim

To have a simple repeatable test for looking at performance of JS FFT implementations run realtime within WebAudio using `ScriptProcessorNode` now, and `AudioWorker` node (when that's added) to compare and contrast against native implementation. 

This fell out of the [WebAudio Spec discussion](https://github.com/WebAudio/web-audio-api/issues/468)

## How?

Runs simple FFT passes over random data using either [dsp.js](https://github.com/corbanbrook/dsp.js/), [jsfft](https://github.com/dntj/jsfft) or [fft-asm.js](https://github.com/g200kg/Fft-asm.js). (Please fork and add more)

The FFT size is settable, and so is the length of time the data is collected. The chunkSize for the `ScriptProcessorNode` is set to the same as FFT size.

The data collected is [DOMHighResolutionTimeStamp](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) at the following moments : 

- immediately at the beginning callback of the `ScriptProcessorNode` : `onAudioProcessStart`
- before FFT calculation : `onFFTStart`
- after FFT calculation : `onFFTEnd`
- at the end of callback of the `ScriptProcessorNode`: `onAudioProcessEnd`

Using this data, the current graph plots : 
- the time difference between successive `ScriptProcessorNode` callbacks :  `(onAudioProcessStart[index]-onAudioProcessEnd[index-1])`
- the time taken for the FFT : `perf.onFFTEnd[index]-perf.onFFTStart[index]`

## License

MIT
