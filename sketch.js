let selectedSound;

let playButton;
let pauseButton;
let stopButton;
let skipToStartButton;
let skipToEndButton;
let recordButton;
let loopButton;
let downloadButton;
let soundFileDropDown;

let sliderVolume;
let sliderRate;
let sliderPan;

let mic;
let recorder;
let recordedSoundFile;
let uploadedSoundFile;

let isRecording = false;
let isLooping = false;


/*
--------- Default Values ---------
*/

const soundFileTypes = {
    UPLOADED: 'Uploaded Sound',
    RECORDED: 'Recorded Sound',
}

// Filter Effect
const filtersType = {
    LOWPASS: 'Low-Pass',
    HIGHPASS: 'High-Pass',
    BANDPASS: 'Band-Pass',
}

// Waveshape Distortion Effect
const defaultDistortionAmount = 0.25;
const defaultOversampleValue = 'none';

let distortionAmount = defaultDistortionAmount;
let oversampleValue = defaultOversampleValue;

// Dynamic Composer Effect
const defaultAttackValue = 0.003;
const defaultKneeValue = 30;
const defaultReleaseValue = 0.25;
const defaultRatioValue = 12;
const defaultThresholdValue = -24;

let attackValue = defaultAttackValue;
let kneeValue = defaultKneeValue;
let ratioValue = defaultRatioValue;
let thresholdValue = defaultThresholdValue;
let releaseValue = defaultReleaseValue;

// Reverb Effect
const defaultDurationValue = 3;
const defaultDecayRateValue = 2;

let durationValue = defaultDurationValue;
let decayRateValue = defaultDecayRateValue;
let playInReverse = false;

/*
--------- Initialization ---------
*/

// Filter Effect
let filter;
let filterDropDown;
let frequencyInputField;
let resonanceInputField;
let filterDryWetSlider;
let filterOutputLevelSlider;

// Waveshape Distortion Effect
let distortion;
let distortionAmountInputField;
let oversampleInputField;
let WaveshapeDistortionDryWetSlider;
let WaveshapeDistortionOutputLevelSlider;

// Dynamic Composer Effect
let compressor;
let attackInputField;
let kneeInputField;
let releaseInputField;
let ratioInputField;
let thresholdInputField;
let dynamicComposerDryWetSlider;
let dynamicComposerOutputLevelSlider;

// Reverb Effect
let reverbDurationInputField;
let decayRateInputField;
let reverseButton;
let reverbDryWetSlider;
let reverbOutputLevelSlider

// Master Volume
let masterVolumeSlider;

// Master Rate
let masterRateSlider;

// Master Pam
let masterPanSlider;

// Spectrum
let fftIn;
let fftOut;




function preload() {
    soundFormats('mp3', 'wav');
    uploadedSoundFile = loadSound('sounds/Ex3_sound4.wav');
    selectedSound = uploadedSoundFile;
}

/*
--------- Set Up ---------
*/

function setup() {
    createCanvas(1200, 850);
    background(180);

    filter = new p5.Filter();
    filter.setType('bandpass')
    
    distortion = new p5.Distortion();
    
    compressor = new p5.Compressor();
    
    reverb = new p5.Reverb()
    
    setupEffects();

    mic = new p5.AudioIn();
    mic.start();

    recorder = new p5.SoundRecorder();
    recorder.setInput(mic);
    recordedSoundFile = new p5.SoundFile();

    let audioContext = getAudioContext();
    let numChannels = 2; // Stereo
    let lengthInSeconds = 1;
    let sampleRate = audioContext.sampleRate;
    let samples = lengthInSeconds * sampleRate;
    let buffer = audioContext.createBuffer(numChannels, samples, sampleRate);

    recordedSoundFile.buffer = buffer;

    setupBasicControl();
    setupFilterEffect();
    setupDynamicCompressor();
    setupReverb();
    setupWaveshaperDistortion();
    setupMasterVolume();
    setupMasterRate();
    setupMasterPan();

    fftIn = new p5.FFT();

    fftOut = new p5.FFT();


    setupSpecturm();
}

// Basic Control
function setupBasicControl() {
    playButton = createCustomButton('Play', 50, 20, playSound);
    pauseButton = createCustomButton('Pause', 150, 20, pauseSound);
    stopButton = createCustomButton('Stop', 250, 20, stopSound);

    skipToStartButton = createCustomButton('Skip to start', 350, 20, skipSoundToStart);
    skipToEndButton = createCustomButton('Skip to end', 450, 20, skipSoundToEnd);

    recordButton = createCustomButton('Record', 550, 20, recordSound);
    loopButton = createCustomButton('Loop', 650, 20, loopSound);
    downloadButton = createCustomButton('Download', 750, 20, downloadSound);
    soundFileDropDown = createStyledDropDown(850, 45,150, Object.values(soundFileTypes), handleSoundFileChange);
}

// Filter Effect
function setupFilterEffect() {

    let x = 50;
    let y = 150;
    let width = 200;
    let height = 320;

    drawBox('Filter Effect', x, y, width, height)

    filterDropDown = createStyledDropDown(x, y + 40, 100, Object.values(filtersType), handleFilterChange);

    frequencyInputField = createStyledInputField("Cutoff Frequency", x + 20, y + 90, 50, handleFrequencyChange, 20);
    resonanceInputField = createStyledInputField("Resonance", x + width - 90, y + 90, 50, handleResonanceChange);

    filterDryWetSlider = createStyledSlider("dry/wet", x, y + height, 50);
    filterOutputLevelSlider = createStyledSlider("output level", x + width - 90, y + height, 50, 0, 1, 0.5, 0.01, 20);

}

// Waveshape Distortion Effect
function setupWaveshaperDistortion() {
    let x = 300;
    let y = 550;
    let width = 200;
    let height = 280;

    drawBox("Waveshape Distortion", x, y, width, height)

    distortionAmountInputField = createStyledInputField("Distortion Amount", x + 20, y + 50, 50, handleDistortionAmountChange, 20);
    oversampleInputField = createStyledInputField("Oversample", x + width - 90, y + 50, 50, handleOversampleChange);

    WaveshapeDistortionDryWetSlider = createStyledSlider("dry/wet", x, y + height, 50);
    WaveshapeDistortionOutputLevelSlider = createStyledSlider("output level", x + width - 90, y + height, 50, 0, 1, 0.5, 0.01, 20);

}

// Dynamic Composer Effect
function setupDynamicCompressor() {
    let x = 300;
    let y = 150;
    let width = 300;
    let height = 350;

    drawBox("Dynamic Compressor", x, y, width, height)

    attackInputField = createStyledInputField("Attack", x + 20, y + 50, 50, handleAttackChange);
    kneeInputField = createStyledInputField("Knee", x + 120, y + 50, 50, handleKneeChange);
    releaseInputField = createStyledInputField("Release", x + width - 90, y + 50, 50, handleReleaseChange);
    ratioInputField = createStyledInputField("Ratio", x + 60, y + 120, 50, handleRatioChange);
    thresholdInputField = createStyledInputField("Threshold", x + 180, y + 120, 50, handleThresholdChange);

    dynamicComposerDryWetSlider = createStyledSlider("dry/wet", x + 50, y + height, 50);
    dynamicComposerOutputLevelSlider = createStyledSlider("output level", x + width - 140, y + height, 50, 0, 1, 0.5, 0.01, 20);

}

// Reverb Effect
function setupReverb() {
    let x = 50;
    let y = 500;
    let width = 200;
    let height = 330;

    drawBox("Reverb", x, y, width, height)

    reverbDurationInputField = createStyledInputField("Reverb Duration", x + 20, y + 50, 50, handleReverbDurationChange, 20);
    decayRateInputField = createStyledInputField("Resonance", x + width - 90, y + 50, 50, handleDecayRateChange);

    reverseButton = createButton('Reverse');
    reverseButton.position(x + 20, y + 100);
    reverseButton.mousePressed(handleReverseButtonClick);

    reverbDryWetSlider = createStyledSlider("dry/wet", x, y + height, 50);
    reverbOutputLevelSlider = createStyledSlider("output level", x + width - 90, y + height, 50, 0, 1, 0.5, 0.01, 20);

}

// Master Volume
function setupMasterVolume() {
    let x = 650;
    let y = 150;
    let width = 100;
    let height = 200;

    drawBox("", x, y, width, height)

    masterVolumeSlider = createStyledSlider("Master Volume", x, y + height, 50, 0, 1, 0.5, 0.01, 20);
}

// Master Rate
function setupMasterRate() {
    let x = 800;
    let y = 150;
    let width = 100;
    let height = 200;

    drawBox("", x, y, width, height)

    masterRateSlider = createStyledSlider("Master Rate", x, y + height, 50, -2, 2, 1, 0.01, 20);
}

// Master Pan
function setupMasterPan() {
    let x = 950;
    let y = 150;
    let width = 100;
    let height = 200;

    drawBox("", x, y, width, height)

    masterPanSlider = createStyledSlider("Master Pan", x, y + height, 50, -1, 1, 0, 0.01, 20);
}

/*
--------- UI (Styled Components) Functions ---------
*/

function drawBox(heading, x, y, width, height, showHeading = true) {
    fill(0);
    if (showHeading) {
        textSize(20);
        textAlign(CENTER, CENTER);
        text(heading, x + width / 2, y - 10);
    }

    noFill();
    rect(x, y, width, height);
}

function createStyledInputField(label, x, y, width, validationFunction, breakDownHeight = 0) {

    let inputLabel = createSpan(label);
    inputLabel.position(x, y - 20 - breakDownHeight);
    inputLabel.style('width', width + 20 + 'px'); // Set label width
    inputLabel.style('text-align', 'center');
    inputLabel.style('word-wrap', 'break-word');

    let input = createInput();
    input.position(x, y);
    input.changed(validationFunction);
    input.style('width', width + 'px'); // Set width
    input.style('padding', '5px'); // Set padding
    input.style('border', '2px solid #ccc'); // Set border
    input.style('border-radius', '4px'); // Set border radius
    input.style('font-size', '16px'); // Set font size
    input.style('outline', 'none'); // Remove outline
    input.style('text-align', 'center'); // Set text alignment
    input.style('color', '#333'); // Set text color

    return input;
}

function createStyledSlider(label, x, y, width, min = 0, max = 1, defaultValue = 0.5, step = 0.1, breakDownHeight = 0) {

    let inputLabel = createSpan(label);
    inputLabel.position(x + 10, y - 170 - breakDownHeight);
    inputLabel.style('width', width + 20 + 'px'); // Set label width
    inputLabel.style('word-wrap', 'break-word');
    inputLabel.style('text-align', 'center');

    let slider = createSlider(min, max, defaultValue, step);
    slider.style('transform', 'rotate(270deg)'); // Rotate the slider vertically
    slider.position(x - 20, y - 130); // Position the slider
    slider.style('height', '100px'); // Set the height of the slider
    slider.style('background', 'transparent'); // Make the slider background transparent
    slider.style('border-radius', '10px'); // Set border-radius to make a rectangle

    return slider;
}

function createCustomButton(label, x, y, onClick) {
    let button = createButton(label);
    button.position(x, y);
    button.mousePressed(onClick);
    button.style('text-align', 'center');
    button.style('word-wrap', 'break-word');
    button.style('width', '80px');
    return button;
}

function createStyledDropDown(x, y,width, filterOptions, handleDropDownChange) {
    let dropDown = createSelect();
    dropDown.position(x, y - 25)

    dropDown.style('width', width + 'px');
    dropDown.style('font-family', 'Arial');
    dropDown.style('background-color', '#000');
    dropDown.style('color', '#fff');
    dropDown.style('border', '1px solid #ddd');

    filterOptions.forEach(element => {
        dropDown.option(element)
    });

    dropDown.changed(handleDropDownChange);

    return dropDown;


}

function drawSpectrumBox(heading, fft, boxX, boxY, boxWidth=300, boxHeight=150, background=0, color=255) {
    fill(background);
    rect(boxX, boxY, boxWidth, boxHeight);

    // Get the frequency spectrum data
    let spectrum = fft.analyze();

    noStroke();
    fill(color);

    // Display the heading
    textAlign(RIGHT, TOP); // Align the text to the top-right corner
    fill(color);
    textSize(24);
    text(heading, boxX + boxWidth - 5, boxY + 5); // Adjust position for text
    

    // Draw the spectrum bars within the box
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 0, spectrum.length, boxX, boxX + boxWidth); // Map frequency data to box width
        let h = map(spectrum[i], 0, 255, 0, boxHeight); // Map amplitude to bar height
        let y = boxY + boxHeight - h; // Calculate bar position from top

        rect(x, y, boxWidth / spectrum.length, h); // Draw the bar
    }

}

/*
--------- Functions to handle the change in input fields ---------
*/

function setupEffects(){
    selectedSound.disconnect();
    selectedSound.connect(filter);

    filter.disconnect();
    filter.connect(distortion);

    distortion.disconnect();
    distortion.connect(compressor);

    compressor.disconnect();
    compressor.connect(reverb);

    reverb.connect();
}

function setupSpecturm(){
    fftIn.setInput(selectedSound);
    fftOut.setInput(reverb);
}


// Filter Effect
function handleFilterChange() {
    let selectedFilter = filterDropDown.value();
    if (selectedFilter === filtersType.LOWPASS) {
        filter.setType('lowpass');
    } else if (selectedFilter === filtersType.HIGHPASS) {
        filter.setType('highpass');
    } else if (selectedFilter === filtersType.BANDPASS) {
        filter.setType('bandpass')
    }
}

function handleFrequencyChange() {
    const minFrequency = 10;
    const maxFrequency = 22050;
    frequency = parseFloat(frequencyInputField.value());

    if (isNaN(frequency) || frequency < minFrequency || frequency > maxFrequency) {
        window.alert('Please enter frquency value within the valid range from 10 to 22050');
        frequencyInputField.value('');
    } else {
        console.log('Input is a valid number:', frequency);
        filter.freq(frequency)
    }
}

function handleResonanceChange() {
    const minResonance = 0.001;
    const maxResonance = 1000;
    resonance = parseFloat(resonanceInputField.value());


    if (isNaN(resonance) || minResonance < minResonance || resonance > maxResonance) {
        window.alert('Please enter resonance value within the valid range from 0.001 to 1000');
        resonanceInputField.value('');
    } else {
        filter.res(resonance);
    }
}

// Waveshape Distortion Effect
function handleDistortionAmountChange() {
    let minDistortionAmout = 0;
    let maxDistortionAmount = 1;
    let distortionAmount = parseFloat(distortionAmountInputField.value());

    if (isNaN(distortionAmount) || distortionAmount < minDistortionAmout || distortionAmount > maxDistortionAmount) {
        window.alert('Please enter resonance value within the valid range from 0 to 1');
        distortionAmount = defaultDistortionAmount;
        distortionAmountInputField.value('');
    } else {
        distortion.set(distortionAmount, oversampleValue);
    }
}

function handleOversampleChange() {
    let possibleOverSampleValues = ['', 'none', '2x', '4x'];
    oversampleValue = oversampleInputField.value();

    if (possibleOverSampleValues.includes(oversampleValue)) {
        distortion.set(distortionAmount, oversampleValue)
    } else {
        window.alert("Please enter oversample value from these options: 'none', '2x', or '4x'");
        oversampleValue = defaultOversampleValue;
        oversampleInputField.value('');
    }
}

// Dynamic Composer Effect
function handleAttackChange() {
    let minAttack = 0;
    let maxAttack = 1; // Set the maximum value you want to allow
    let attackValue = parseFloat(attackInputField.value());

    if (isNaN(attackValue) || attackValue < minAttack || attackValue > maxAttack) {
        window.alert('Please enter attack value within the valid range from 0 to 1');
        attackValue = defaultAttackValue;
        attackInputField.value('');
    } else {
        console.log('Input is a valid number:', attackValue);
        compressor.set(attackValue, kneeValue, ratioValue, thresholdValue, releaseValue);
        // Proceed with handling the valid input
    }
}

function handleKneeChange() {
    let minKnee = 0;
    let maxKnee = 40; // Set the maximum value you want to allow
    let kneeValue = parseFloat(kneeInputField.value());

    if (isNaN(kneeValue) || kneeValue < minKnee || kneeValue > maxKnee) {
        window.alert('Please enter knee value within the valid range from 0 to 40');
        kneeValue = defaultKneeValue;
        kneeInputField.value('');
    } else {
        console.log('Input is a valid number:', kneeValue);
        compressor.set(attackValue, kneeValue, ratioValue, thresholdValue, releaseValue);
    }
}

function handleRatioChange() {
    let minRatio = 1;
    let maxRatio = 20; // Set the maximum value you want to allow
    let ratioValue = parseFloat(ratioInputField.value());

    if (isNaN(ratioValue) || ratioValue < minRatio || ratioValue > maxRatio) {
        window.alert('Please enter ratio value within the valid range (1 - 20)');
        ratioValue = defaultRatioValue;
        ratioInputField.value('');
    } else {
        console.log('Input is a valid number:', ratioValue);
        compressor.set(attackValue, kneeValue, ratioValue, thresholdValue, releaseValue);
        // Proceed with handling the valid input
    }
}

function handleThresholdChange() {
    let minThreshold = -100;
    let maxThreshold = 0; // Set the maximum value you want to allow
    let thresholdValue = parseFloat(thresholdInputField.value());

    if (isNaN(thresholdValue) || thresholdValue < minThreshold || thresholdValue > maxThreshold) {
        window.alert('Please enter threshold value within the valid range (-100 to 0)');
        thresholdValue = defaultThresholdValue;
        thresholdInputField.value('');
    } else {
        console.log('Input is a valid number:', thresholdValue);
        compressor.set(attackValue, kneeValue, ratioValue, thresholdValue, releaseValue);
        // Proceed with handling the valid input
    }
}

function handleReleaseChange() {
    let minRelease = 0;
    let maxRelease = 1; // Set the maximum value you want to allow
    let releaseValue = parseFloat(releaseInputField.value());

    if (isNaN(releaseValue) || releaseValue < minRelease || releaseValue > maxRelease) {
        window.alert('Please enter release value within the valid range (0.001 - 1000)');
        releaseValue = defaultReleaseValue;
        releaseInputField.value('');
    } else {
        console.log('Input is a valid number:', releaseValue);
        compressor.set(attackValue, kneeValue, ratioValue, thresholdValue, releaseValue);
    }
}

// Reverb Effect
function handleReverbDurationChange() {
    let minDuration = 0;
    let maxDuration = 10; // Set the maximum value you want to allow
    durationValue = parseFloat(reverbDurationInputField.value());

    if (isNaN(durationValue) || durationValue < minDuration || durationValue > maxDuration) {
        window.alert('Please enter reverb duration value within the valid range (0.001 - 10)');
        durationValue = defaultDurationValue;
        durationValue.value('');
    } else {
        console.log('Input is a valid number:', durationValue);
        reverb.set(durationValue, decayRateValue, playInReverse);
    }
}

function handleDecayRateChange() {
    let minDecayRate = 0;
    let maxDecayRate = 100; // Set the maximum value you want to allow
    decayRateValue = parseFloat(decayRateInputField.value());

    if (isNaN(decayRateValue) || decayRateValue < minDecayRate || decayRateValue > maxDecayRate) {
        window.alert('Please enter decay rate value within the valid range (0.001 - 100)');
        decayRateValue = defaultDecayRateValue;
        decayRateInputField.value('');
    } else {
        console.log('Input is a valid number:', decayRateValue);
        reverb.set(durationValue, decayRateValue, playInReverse);
    }
}

function handleReverseButtonClick() {
    playInReverse = !playInReverse;
    if (playInReverse) {
        reverseButton.html('No Reverse');
        reverseButton.style('color', '#ff0000')
    }
    else {
        reverseButton.html('Reverse');
        reverseButton.style('color', '#000')
    }
    reverb.set(durationValue, decayRateValue, playInReverse);
}

/*
--------- More ---------
*/

function playSound() {
    if (!selectedSound.isPlaying())
        selectedSound.play();
}

function pauseSound() {
    if (selectedSound.isPlaying())
        selectedSound.pause();
}

function stopSound() {
    selectedSound.stop();
}

function skipSoundToStart() {
    selectedSound.jump(0);
}

function skipSoundToEnd() {
    selectedSound.jump(selectedSound.duration() - .01);
}

function loopSound() {
    if (isLooping) {
        selectedSound.setLoop(!isLooping);
        loopButton.html("Loop")
        loopButton.style('color', '#000')
    }
    else {
        selectedSound.setLoop(!isLooping);
        loopButton.html("No Loop")
        loopButton.style('color', '#ff0000')
    }
    isLooping = !isLooping;
}

function recordSound() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
    if (isRecording) {
        recorder.stop();
        recordButton.html("Record")
        recordButton.style('color', '#000')
    }
    else {
        recorder.record(recordedSoundFile);
        recordButton.html("Stop Recording")
        recordButton.style('color', '#ff0000')    
    }
    isRecording = !isRecording;

}

function downloadSound(){
    save(selectedSound, soundFileDropDown.value() + '.wav')
}

function handleSoundFileChange(){
    stopSound();
    let selectedSoundFile = soundFileDropDown.value();
    if (selectedSoundFile === soundFileTypes.RECORDED) {
        selectedSound = recordedSoundFile;
    } else if (selectedSoundFile === soundFileTypes.UPLOADED) {
        selectedSound = uploadedSoundFile;
    }

    setupEffects();
    setupSpecturm();
    
}

function draw() {
    filter.drywet(filterDryWetSlider.value());
    filter.amp(filterOutputLevelSlider.value());

    distortion.drywet(WaveshapeDistortionDryWetSlider.value());
    distortion.amp(WaveshapeDistortionOutputLevelSlider.value());

    compressor.drywet(dynamicComposerDryWetSlider.value());
    compressor.amp(dynamicComposerOutputLevelSlider.value());

    reverb.drywet(reverbDryWetSlider.value());
    reverb.amp(reverbOutputLevelSlider.value());

    selectedSound.setVolume(masterVolumeSlider.value());
    selectedSound.rate(masterRateSlider.value());
    selectedSound.pan(masterPanSlider.value())

    drawSpectrumBox("Specturm IN", fftIn, 650, 400);
    drawSpectrumBox("Specturm OUT", fftOut, 650, 600);
}

