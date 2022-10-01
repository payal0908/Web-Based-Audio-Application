let mySound;
let playStopButton;
let sliderVolume;
let jumpButton;
let dryWetLPSlider;
let ouputVolLPSlider;
let dryWetDCSlider;
let outputVolDCSlider;
let dryWetDSlider;
let outputVolDSlider;
let dryWetRSlider;
let outputVolRSlider;

let playButton;
let stopButton;
let pauseButton;
let skipToStart;
let skipToEnd;
let loop;
let record;
let reverse;
let mic, recorder, soundFileRec;
let state = 0;
let lowpassFilter;
let dynCompressor;
let inputSel;
let inputVal;

let filterSel;
let val;

let distortion;

let reverbFilter;
let reverseFlag = false; 

var fft;
var masterVolKnob;
var cutoffFreqKnob;
var distAmountKnob;
var oversampleKnob;
var durKnob;
var decayKnob;
var pointerCursor = false; 

var volume;
let spec;
let spec_lin;
let fft2;


let soundFile = '/Exercise_Sounds/ex1_sound.wav';
let sound;

function preload() {
    soundFormats('mp3', 'wav');

    sound = loadSound(soundFile);
}

function setup() {
    createCanvas(1000, 800);
    background(180);
    
    filterSel = createSelect();
    filterSel.size(80);
    filterSel.position(97,170);
    filterSel.option('low-pass');
    filterSel.option('high-pass');
    filterSel.option('band-pass');
    val = filterSel.value();
    filterSel.changed(filterChange);
    
    inputSel = createSelect();
    inputSel.size(140,50);
    inputSel.position(600, 10);
    inputSel.option('Pre-loaded Sound');
    inputSel.option('Mic input');
    inputVal = inputSel.value();
    console.log(inputVal);
    inputSel.changed(recInputChange);
    
    
    lowpassFilter = new p5.Filter();
    lowpassFilter.setType("lowpass");
    dynCompressor = new p5.Compressor();
    distortion = new p5.Distortion();
    reverbFilter = new p5.Reverb();
    
    sound.disconnect();
    fft2 = new p5.FFT();
    fft2.setInput(sound);
    sound.connect(lowpassFilter);
    
    lowpassFilter.chain(distortion,dynCompressor,reverbFilter);
    fft = new p5.FFT();
    fft.setInput(lowpassFilter.chain(distortion,dynCompressor,reverbFilter));

    mic = new p5.AudioIn();
    recorder = new p5.SoundRecorder();
    recorder.setInput(lowpassFilter.chain(distortion,dynCompressor,reverbFilter));
    soundFileRec = new p5.SoundFile();
    
    gui_config();
}

function draw() {
    background(180);
    
    gui_colors();
    
    labels();
    
    push();
    noFill();
    stroke(0);
    rect(545,280,30,-100);
    pop();
    
    pointerCursor = false;
    update_knobs();
    
    noFill();
    fill(0,200,0);
    rect(545,280, 30, -masterVolKnob.knobValue);    

    x = fft.waveform();
    noFill();
    stroke(255, 255, 0);
    strokeWeight(1);
    
    lowpassFilter.set(cutoffFreqKnob.knobValue);
    lowpassFilter.res(resKnob.knobValue);

    lowpassFilter.drywet(dryWetLPSlider.value());
    lowpassFilter.amp(ouputVolLPSlider.value());
    
    let os;
    if(oversampleKnob.knobValue == 0){
        os = "none";
    }
    else if( oversampleKnob.knobValue == 2){
        os = "2x";
    }
    else if(oversampleKnob.knobValue == 4){
        os = "4x"
    }
    distortion.set(distAmountKnob.knobValue, os);
    distortion.drywet(dryWetDSlider.value());
    distortion.amp(outputVolDSlider.value());
    
    dynCompressor.attack(attackKnob.knobValue);
    dynCompressor.knee(kneeKnob.knobValue);
    dynCompressor.release(releaseKnob.knobValue);
    dynCompressor.ratio(ratioKnob.knobValue);
    dynCompressor.threshold(thresKnob.knobValue);
    dynCompressor.drywet(dryWetDCSlider.value());
    dynCompressor.amp(outputVolDCSlider.value());
    
    reverbFilter.drywet(dryWetRSlider.value());
    reverbFilter.amp(outputVolRSlider.value());
    dryWetRSlider.changed(cb);
    
    
    volume = masterVolKnob.knobValue;
    volume = map(volume,0,100,0,1);
    sound.setVolume(volume);
    
    if (pointerCursor) { cursor('pointer'); } else { cursor('default'); }
    
    let h1 = 490;
    let w1 = 510;
    spec = fft2.analyze();
    noStroke();
    fill(170,0,10,100);
    for(i=0;i<spec.length;i++){
        f = map(i, 0, spec.length, w1, 800);
        Y = -h1 + map(spec[i], 0, 255, h1, 300);
        rect(f, h1, w1/spec.length, Y)
    }
    
    let h = 690;
    let w = 510;
    X = fft.analyze();
    noStroke();
    fill(170,0,10,100);
    for(i=0;i<X.length;i++){
        f = map(i, 0, X.length, w, 800);
        Y = -h + map(X[i], 0, 255, h, 500);
        rect(f, h, w/X.length, Y)
    }
}

function recInputChange() {
    stopSound();
    inputVal = inputSel.value();
    
    if(inputVal=='Mic input'){
        mic.start();
        recorder.setInput(mic);
        fft.setInput(mic);
        
    }
    else if(inputVal=='Pre-loaded Sound'){
        mic.stop();
        recorder.setInput(lowpassFilter.chain(distortion,dynCompressor,reverbFilter));
        fft.setInput(lowpassFilter.chain(distortion,dynCompressor,reverbFilter));
    }
    
}

function cb() {
    reverbFilter.set(durKnob.knobValue, decayKnob.knobValue, reverseFlag);
}

function update_knobs() {
    masterVolKnob.update();
    cutoffFreqKnob.update();
    resKnob.update();
    attackKnob.update();
    kneeKnob.update();
    releaseKnob.update();
    ratioKnob.update();
    thresKnob.update();
    distAmountKnob.update();
    oversampleKnob.update();
    durKnob.update();
    decayKnob.update();
}

function gui_colors() {
    fill(255,0,0,100);
    rect(60, 70, 150, 260);
    
    fill(0,0,255,100);
    rect(250,70,242,340);
    
    fill(100,0,100,100);
    rect(250, 420, 242, 270);
    
    fill(150,170,0,100);
    rect(60,360,150,330);
    
    fill(255,255,255,100);
    rect(510, 70, 100, 220);
    
    push();
    fill(125);
    stroke(0);
    rect(510, 490, 300, 200);
    pop();
    
    push();
    fill(125);
    stroke(0);
    rect(510, 290, 300, 200);
    pop();
}

function labels() {
    fill(0);
    textSize(14);
    text('Filters', 115,87);
    text('Dynamic Compressor', 300,87);
    text('Waveshaper Distortion', 300, 440);
    text('Master Volume', 514, 165);
    text('Reverb', 110, 380);
    text('Spectrum In', 720, 320);
    text('Spectrum Out',710, 520);
    textSize(10);
    text('Cut off Freq', 66, 157);
    text('Resonance', 155,157);
    text('Dry/Wet', 73, 315);
    text('Output vol', 160, 315);
    text('Attack', 265,157);
    text('Knee', 358, 157);
    text('Release', 442,157);
    text('Ratio', 314,240);
    text('Threshold', 394,240);
    text('Dry/Wet',309, 400);
    text('Output vol', 396, 400);
    text('Distortion Amount', 287, 514);
    text('Oversample', 394,514);
    text('Dry/Wet', 309, 680);
    text('Output vol', 396, 680);
    text('Duration', 71, 447);
    text('Decay', 165, 447);
    text('Dry/Wet', 75, 680);
    text('Output vol', 158,680);

}

function gui_config() {
    
    masterVolKnob = new MakeKnob("images/knob3agrey.png", 75, 560, 110, 0, 100, 50, 0);
    cutoffFreqKnob = new MakeKnob("images/knob3agrey.png", 50, 90, 120, 10, 22050, 100, 0);
    resKnob = new MakeKnob("images/knob3agrey.png", 50, 180, 120, 0.001, 1000, 0, 0);
    
    attackKnob = new MakeKnob("images/knob3agrey.png",50, 280,120, 0,1,0.003,0);
    kneeKnob = new MakeKnob("images/knob3agrey.png", 50, 370, 120, 0,40,30,0);
    releaseKnob = new MakeKnob("images/knob3agrey.png", 50, 460,120, 0,1, 0.25,0);
    ratioKnob = new MakeKnob("images/knob3agrey.png", 50,326,200,1,20,12,0);
    thresKnob = new MakeKnob("images/knob3agrey.png", 50, 416,200,-100,0,-24,0);
    
    distAmountKnob = new MakeKnob("images/knob3agrey.png", 50, 326, 475, 0,1,0,0);
    oversampleKnob = new MakeKnob("images/knob3agrey.png", 50, 419, 475, 0,4, 0,3);
    
    durKnob = new MakeKnob("images/knob3agrey.png", 50, 90, 410, 0,10,0,0);
    decayKnob = new MakeKnob("images/knob3agrey.png", 50, 180, 410, 0,100,0,0);
    
    masterVolKnob.moveRange=128;
    cutoffFreqKnob.moveRange = 128;
    resKnob.moveRange = 128;
    attackKnob.moveRange = 128;
    kneeKnob.moveRange = 128;
    releaseKnob.moveRange = 128;
    ratioKnob.moveRange = 128;
    thresKnob.moveRange = 128;
    distAmountKnob.moveRange = 128;
    oversampleKnob.moveRange = 4;
    durKnob.moveRange = 128;
    decayKnob.moveRange = 128;
    
    playButton = createButton('PLAY');
    playButton.size(70,50);
    playButton.position(70,10);
    playButton.mousePressed(playSound);
    
    stopButton = createButton('STOP');
    stopButton.size(70,50);
    stopButton.position(145,10);
    stopButton.mousePressed(stopSound);
    
    pauseButton = createButton('PAUSE');
    pauseButton.size(70,50);
    pauseButton.position(220,10);
    pauseButton.mousePressed(pauseSound);
    
    skipToStart = createButton('SKIP - START');
    skipToStart.size(70,50);
    skipToStart.position(296, 10);
    skipToStart.mousePressed(skipToStartSound);
    
    skipToEnd = createButton('SKIP - END');
    skipToEnd.size(70,50);
    skipToEnd.position(372, 10);
    skipToEnd.mousePressed(skipToEndSound);
    
    loop = createButton('LOOP');
    loop.size(70,50);
    loop.position(448, 10);
    loop.mousePressed(loopSound);
    
    dryWetLPSlider = createSlider(0,1,0.5,0.1);
    dryWetLPSlider.position(25,225);
    dryWetLPSlider.style("transform", "rotate(270deg)");
    
    ouputVolLPSlider = createSlider(0,1,0.5,0.1);
    ouputVolLPSlider.position(115,225);
    ouputVolLPSlider.style("transform", "rotate(270deg)");
    
    dryWetDCSlider = createSlider(0,1,0,0.1);
    dryWetDCSlider.position(259,310);
    dryWetDCSlider.style("transform", "rotate(270deg)");
    
    outputVolDCSlider = createSlider(0,1,0.5,0.1);
    outputVolDCSlider.position(350,310);
    outputVolDCSlider.style("transform", "rotate(270deg)");
    
    dryWetDSlider = createSlider(0,1,0,0);
    dryWetDSlider.position(259,590);
    dryWetDSlider.style("transform", "rotate(270deg)");
    
    outputVolDSlider = createSlider(0,1,0.5,0.1);
    outputVolDSlider.position(350,590);
    outputVolDSlider.style("transform", "rotate(270deg)");
    
    dryWetRSlider = createSlider(0,1,0,0);
    dryWetRSlider.position(25,590);
    dryWetRSlider.style("transform", "rotate(270deg)");
    
    outputVolRSlider = createSlider(0,1,0,0);
    outputVolRSlider.position(115,590);
    outputVolRSlider.style("transform", "rotate(270deg)");
    
    record = createButton('RECORD');
    record.size(70,50);
    record.position(524, 10);
    let c = color(255,0,0,0.7*255);
    record.style('background-color', c);
    record.mousePressed(recordSound);
    
    reverse = createButton('REVERSE');
    reverse.size(80,20);
    reverse.position(95,480);
    reverse.mousePressed(reverbReverse);
}

function reverbReverse() {
    reverseFlag = !reverseFlag;
    reverbFilter.set(durKnob.knobValue, decayKnob.knobValue, reverseFlag);
}

function filterChange() {
    val = filterSel.value();
    if(val=='low-pass'){
        lowpassFilter.setType("lowpass");
    }
    else if(val=='high-pass') {
        lowpassFilter.setType("highpass");
    }
    else if(val=='bandpass'){
        lowpassFilter.setType("bandpass");
    }
}

function recordSound() {
    if(state == 0){
        mic.start();
        recorder.record(soundFileRec);
        state++; 
    }
    else if (state == 1){
        recorder.stop();
        stopSound();
        save(soundFileRec, 'rec_sound.wav');
        console.log(state);
        state=0;
    }
}


function loopSound() {
    sound.loop();
}

function playSound() {
    
    if(sound.isPlaying()){
        
    } else {
        sound.play();
    }
}

function stopSound() {
    if(sound.isPlaying()){
        sound.stop();
    } 
}

function pauseSound() {
    if(sound.isPlaying()){
        sound.pause();
    }
}

function skipToStartSound() {
    if(sound.isPlaying()){
        sound.jump(0);
    } else {
        sound.play(0,1,1,1);
    }
}

function skipToEndSound() {
    if(sound.isPlaying()){
        sound.jump(sound.duration()-5);
    } else {
        sound.play(0,1,1,1);
    }
}

function mousePressed() {
    masterVolKnob.active();
    cutoffFreqKnob.active();
    resKnob.active();
    attackKnob.active();
    kneeKnob.active();
    releaseKnob.active();
    ratioKnob.active();
    thresKnob.active();
    distAmountKnob.active();
    oversampleKnob.active();
    durKnob.active();
    decayKnob.active();
}

function mouseReleased() {
    masterVolKnob.inactive();
    cutoffFreqKnob.inactive();
    resKnob.inactive();
    attackKnob.inactive();
    kneeKnob.inactive();
    releaseKnob.inactive();
    ratioKnob.inactive();
    thresKnob.inactive();
    distAmountKnob.inactive();
    oversampleKnob.inactive();
    durKnob.inactive();
    decayKnob.inactive();
}