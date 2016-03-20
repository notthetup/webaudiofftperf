window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();


window.addEventListener('load', function (){
  var runButton = document.getElementById('runButton');
  var fftSize = document.getElementById('fftsize');
  var fftImpl = document.getElementById('fftimpl');
  var timeDur = document.getElementById('timeDuration');

  var loadingSpinner = document.getElementById('loading');
  var spinnerCheckbox = document.getElementById('spinnerCheckbox');

  runButton.addEventListener('click', function (){
    window.chart.clearChart();
    if (spinnerCheckbox.checked){
      loadingSpinner.style.display = '';
    }
    runButton.disabled = true;
    var fftSizeVal = parseInt(fftSize.value);
    var timeDuration = parseInt(timeDur.value);

    var fft;
    if (fftimpl.value === "dsp.js"){
      fft = new FFT(fftSizeVal, 44100);
      fftFunc = fft.forward.bind(fft);
    }else if(fftimpl.value === "jsfft"){
      fft = new complex_array.ComplexArray(fftSizeVal);
      fftFunc = function(buffer){
        this.map(function(value, i, n) {
          value.real = buffer[i];
        });
        this.FFT();
      }.bind(fft);
    }else if(fftimpl.value === "fft-asm.js"){
      fft = new FftModule(fftSizeVal, true);
      fftFunc = (function () {
        var imag = new Float32Array(fftSizeVal);

        return function (buffer){
          if (typeof imag.fill === 'function') {
            imag.fill(0);
          } else {
            Array.prototype.map.call(imag, function () {
              return 0;
            });
          }

          fft.fft(buffer, imag, false);
        };
      })();
    }else{
      fftFunc = function(){};
    }


    console.log("running test", fftSizeVal, timeDuration);

    runTest(audioContext, fftSizeVal, fftFunc, timeDuration, function(perf){
      loadingSpinner.style.display = 'none'
      drawChart(massageData(perf), (fftSizeVal/44.100)*2);
      runButton.disabled = false;
    });
  })
})

function drawChart(perfData, vMax) {

  // Create the data table.
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Index');
  data.addColumn('number', 'FFT Time (msec)');
  data.addColumn('number', 'Callback (msec)');
  data.addRows(perfData);

  // Set chart options
  var options = {
    'width':1200,
    'height':400,
    'legend' : {'position' : "in"},
    'vAxis' : {'viewWindow' : {'max' : vMax}},
    'explorer': {
      'maxZoomIn':1/10,
      'keepInBounds': true
    }};

  // Instantiate and draw our chart, passing in some options.
  window.chart.draw(data, options);
}

function massageData(perf){
  var perfData = []

  perf.onFFTEnd.forEach(function(thisEnd, index){
    var FFTdiff = (thisEnd-perf.onFFTStart[index]);
    var onStartDiff
    if(index === 0){
      onStartDiff = 0;
    }else{
      onStartDiff = (perf.onAudioProcessStart[index]-perf.onAudioProcessEnd[index-1])
    }

    perfData.push([index, FFTdiff , onStartDiff ]);
  });

  // array of arrays
  return perfData;
}

function runTest(audioContext, fftSize, fftFunction, timeInmsec, oncomplete){
  window.perf = {};

  perf.onAudioProcessStart = [];
  perf.onFFTStart = [];
  perf.onFFTEnd = [];
  perf.onAudioProcessEnd = [];

  window.oscillator = audioContext.createOscillator();
  window.scriptProcessor = audioContext.createScriptProcessor(fftSize, 1, 1);
  scriptProcessor.onaudioprocess = function(evt){
    window.perf.onAudioProcessStart.push(performance.now())
    var data = evt.inputBuffer.getChannelData(0);

    window.perf.onFFTStart.push(performance.now());

    //Do FFT Here
    fftFunction(data);

    window.perf.onFFTEnd.push(performance.now());

    window.perf.onAudioProcessEnd.push(performance.now())
  }
  oscillator.connect(scriptProcessor);
  scriptProcessor.connect(audioContext.destination);

  window.setTimeout(function(){
    window.scriptProcessor.disconnect();
    console.log("Finished");
    if (typeof oncomplete === 'function' ){
      oncomplete(window.perf);
    }
  }, timeInmsec)
}
