const camera = document.querySelector(".camera");

const powerButton = document.querySelector(".power-button");
const shutterButton = document.querySelector(".shutter-button");

const memoryImage = document.querySelector("#memory-image");
const focusBox = document.querySelector(".focus-box");

const videoButton = document.querySelector(".video");

const currentPhoto = document.querySelector("#current-photo");
const totalPhotos = document.querySelector("#total-photos");

const recordTime = document.querySelector("#record-time");
const batteryLevel = document.querySelector("#battery-level");

const liveView = document.querySelector(".live-view");

const playbackIndicator =
    document.querySelector(".playback-indicator");

const zoomWide =
    document.querySelector(".zoom-wide");

const zoomTele =
    document.querySelector(".zoom-tele");


// =========================================================
// CAMERA STATE
// =========================================================

let cameraOn = false;
let starting = false;
let takingPhoto = false;

let photoNumber = 0;

let battery = 100;

let recording = false;
let recordingSeconds = 0;
let recordingInterval = null;

let zoomLevel = 1;


// =========================================================
// MEMORY PHOTOS
// =========================================================

const memories = [
    "images/test-1.png",
    "images/test-2.png",
    "images/test-3.png"
];

totalPhotos.textContent = memories.length;


// =========================================================
// AUDIO SYSTEM
// =========================================================

let audioContext = null;


function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    if (audioContext.state === "suspended") {

        audioContext.resume();

    }

    return audioContext;
}


// =========================================================
// GENERIC TONE
// =========================================================

function playTone(
    frequency,
    duration,
    volume = 0.04,
    type = "sine"
) {

    const ctx = getAudioContext();

    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
        frequency,
        now
    );

    gain.gain.setValueAtTime(
        volume,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);

    oscillator.stop(
        now + duration
    );
}


// =========================================================
// MOTOR SOUND
// =========================================================

function playMotor(
    duration = 0.55,
    direction = "up"
) {

    const ctx = getAudioContext();

    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sawtooth";

    if (direction === "up") {

        oscillator.frequency.setValueAtTime(
            110,
            now
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            310,
            now + duration
        );

    } else {

        oscillator.frequency.setValueAtTime(
            310,
            now
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            95,
            now + duration
        );
    }

    gain.gain.setValueAtTime(
        0.001,
        now
    );

    gain.gain.linearRampToValueAtTime(
        0.035,
        now + 0.05
    );

    gain.gain.setValueAtTime(
        0.035,
        now + duration - 0.08
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);

    oscillator.stop(
        now + duration
    );

    setTimeout(
        () => {

            playTone(
                direction === "up"
                    ? 700
                    : 500,
                0.08,
                0.012,
                "square"
            );

        },
        duration * 1000
    );
}


// =========================================================
// POWER-ON SOUND
// =========================================================

function playPowerOnSound() {

    getAudioContext();

    playMotor(
        0.65,
        "up"
    );

    setTimeout(
        () => {

            playTone(
                480,
                0.06,
                0.035,
                "square"
            );

        },
        500
    );

    setTimeout(
        () => {

            playTone(
                880,
                0.09,
                0.035,
                "sine"
            );

        },
        850
    );
}


// =========================================================
// POWER-OFF SOUND
// =========================================================

function playPowerOffSound() {

    getAudioContext();

    playTone(
        620,
        0.08,
        0.03,
        "sine"
    );

    setTimeout(
        () => {

            playMotor(
                0.65,
                "down"
            );

        },
        100
    );

    setTimeout(
        () => {

            playTone(
                260,
                0.07,
                0.025,
                "square"
            );

        },
        720
    );
}


// =========================================================
// FOCUS SOUND
// =========================================================

function playFocusSound() {

    getAudioContext();

    playTone(
        720,
        0.055,
        0.035,
        "sine"
    );

    setTimeout(
        () => {

            playTone(
                1050,
                0.065,
                0.035,
                "sine"
            );

        },
        70
    );
}


// =========================================================
// SHUTTER SOUND
// =========================================================

function playShutterSound() {

    const ctx = getAudioContext();

    const now = ctx.currentTime;


    // FIRST SHUTTER CURTAIN

    const clickOscillator =
        ctx.createOscillator();

    const clickGain =
        ctx.createGain();

    clickOscillator.type =
        "square";

    clickOscillator.frequency.setValueAtTime(
        2100,
        now
    );

    clickOscillator.frequency.exponentialRampToValueAtTime(
        380,
        now + 0.035
    );

    clickGain.gain.setValueAtTime(
        0.10,
        now
    );

    clickGain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.045
    );

    clickOscillator.connect(
        clickGain
    );

    clickGain.connect(
        ctx.destination
    );

    clickOscillator.start(now);

    clickOscillator.stop(
        now + 0.045
    );


    // SECOND SHUTTER CURTAIN

    const secondOscillator =
        ctx.createOscillator();

    const secondGain =
        ctx.createGain();

    secondOscillator.type =
        "triangle";

    secondOscillator.frequency.setValueAtTime(
        1250,
        now + 0.065
    );

    secondOscillator.frequency.exponentialRampToValueAtTime(
        190,
        now + 0.115
    );

    secondGain.gain.setValueAtTime(
        0.075,
        now + 0.065
    );

    secondGain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.125
    );

    secondOscillator.connect(
        secondGain
    );

    secondGain.connect(
        ctx.destination
    );

    secondOscillator.start(
        now + 0.065
    );

    secondOscillator.stop(
        now + 0.13
    );


    // HIGH FREQUENCY MECHANISM

    const mechanism =
        ctx.createOscillator();

    const mechanismGain =
        ctx.createGain();

    mechanism.type =
        "sine";

    mechanism.frequency.setValueAtTime(
        3400,
        now + 0.01
    );

    mechanism.frequency.exponentialRampToValueAtTime(
        850,
        now + 0.075
    );

    mechanismGain.gain.setValueAtTime(
        0.018,
        now + 0.01
    );

    mechanismGain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.08
    );

    mechanism.connect(
        mechanismGain
    );

    mechanismGain.connect(
        ctx.destination
    );

    mechanism.start(
        now + 0.01
    );

    mechanism.stop(
        now + 0.085
    );


    // BODY CLICK

    setTimeout(
        () => {

            playTone(
                210,
                0.045,
                0.025,
                "square"
            );

        },
        130
    );
}


// =========================================================
// ZOOM MOTOR SOUND
// =========================================================

function playZoomSound(direction) {

    const ctx = getAudioContext();

    const now = ctx.currentTime;

    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();

    oscillator.type =
        "sawtooth";

    if (direction === "tele") {

        oscillator.frequency.setValueAtTime(
            180,
            now
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            420,
            now + 0.16
        );

    } else {

        oscillator.frequency.setValueAtTime(
            420,
            now
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            170,
            now + 0.16
        );
    }

    gain.gain.setValueAtTime(
        0.001,
        now
    );

    gain.gain.linearRampToValueAtTime(
        0.025,
        now + 0.025
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.17
    );

    oscillator.connect(gain);

    gain.connect(
        ctx.destination
    );

    oscillator.start(now);

    oscillator.stop(
        now + 0.18
    );
}


// =========================================================
// POWER BUTTON
// =========================================================

powerButton.addEventListener(
    "click",
    () => {

        if (starting) return;

        getAudioContext();


        // TURN CAMERA OFF

        if (cameraOn) {

            cameraOn = false;

            camera.classList.remove(
                "camera-on"
            );

            if (recording) {
                stopRecording();
            }

            playPowerOffSound();

            return;
        }


        // START CAMERA

        starting = true;

        camera.classList.add(
            "camera-starting"
        );

        playPowerOnSound();


        setTimeout(
            () => {

                camera.classList.remove(
                    "camera-starting"
                );

                camera.classList.add(
                    "camera-on"
                );

                cameraOn = true;

                starting = false;

                photoNumber = 0;

                memoryImage.src =
                    memories[
                        photoNumber
                    ];

                updatePhotoCounter();

                zoomLevel = 1;

                updateZoom();

            },
            1500
        );
    }
);


// =========================================================
// SHUTTER BUTTON
// =========================================================

shutterButton.addEventListener(
    "click",
    () => {

        if (!cameraOn) return;

        if (takingPhoto) return;

        takingPhoto = true;


        // FOCUS

        focusBox.classList.add(
            "focused"
        );

        playFocusSound();


        setTimeout(
            () => {

                focusBox.classList.remove(
                    "focused"
                );

                focusBox.classList.add(
                    "locked"
                );

            },
            300
        );


        // SHUTTER

        setTimeout(
            () => {

                camera.classList.add(
                    "taking-photo"
                );

                camera.classList.add(
                    "camera-shake"
                );

                playShutterSound();


                // CHANGE PHOTO

                photoNumber++;

                if (
                    photoNumber >=
                    memories.length
                ) {
                    photoNumber = 0;
                }


                liveView.classList.add(
                    "photo-changing"
                );


                setTimeout(
                    () => {

                        memoryImage.src =
                            memories[
                                photoNumber
                            ];

                        updatePhotoCounter();

                        liveView.classList.remove(
                            "photo-changing"
                        );

                    },
                    100
                );


                // CLEAN UP

                setTimeout(
                    () => {

                        camera.classList.remove(
                            "taking-photo"
                        );

                        camera.classList.remove(
                            "camera-shake"
                        );

                        focusBox.classList.remove(
                            "locked"
                        );

                        takingPhoto = false;

                        decreaseBattery(1);

                    },
                    300
                );

            },
            400
        );
    }
);


// =========================================================
// PHOTO COUNTER
// =========================================================

function updatePhotoCounter() {

    currentPhoto.textContent =
        photoNumber + 1;
}


// =========================================================
// BATTERY
// =========================================================

function decreaseBattery(amount) {

    battery -= amount;

    if (battery < 0) {
        battery = 0;
    }

    batteryLevel.textContent =
        battery + "%";


    if (battery === 0) {

        cameraOn = false;

        camera.classList.remove(
            "camera-on"
        );

        stopRecording();
    }
}


// =========================================================
// VIDEO BUTTON
// =========================================================

videoButton.addEventListener(
    "click",
    () => {

        if (!cameraOn) return;

        if (recording) {

            stopRecording();

        } else {

            startRecording();

        }
    }
);


// =========================================================
// START RECORDING
// =========================================================

function startRecording() {

    recording = true;

    recordingSeconds = 0;

    camera.classList.add(
        "recording"
    );

    updateRecordTime();


    playTone(
        650,
        0.07,
        0.035,
        "sine"
    );


    setTimeout(
        () => {

            playTone(
                900,
                0.07,
                0.035,
                "sine"
            );

        },
        80
    );


    recordingInterval =
        setInterval(
            () => {

                recordingSeconds++;

                updateRecordTime();


                if (
                    recordingSeconds % 10 ===
                    0
                ) {

                    decreaseBattery(1);

                }

            },
            1000
        );
}


// =========================================================
// STOP RECORDING
// =========================================================

function stopRecording() {

    if (!recording) return;

    recording = false;

    camera.classList.remove(
        "recording"
    );

    clearInterval(
        recordingInterval
    );

    recordingInterval = null;


    playTone(
        900,
        0.07,
        0.035,
        "sine"
    );


    setTimeout(
        () => {

            playTone(
                600,
                0.09,
                0.035,
                "sine"
            );

        },
        80
    );
}


// =========================================================
// RECORDING TIMER
// =========================================================

function updateRecordTime() {

    const minutes =
        Math.floor(
            recordingSeconds / 60
        );

    const seconds =
        recordingSeconds % 60;

    recordTime.textContent =

        String(minutes).padStart(
            2,
            "0"
        )

        +

        ":"

        +

        String(seconds).padStart(
            2,
            "0"
        );
}


// =========================================================
// ZOOM
// =========================================================

zoomWide.addEventListener(
    "click",
    () => {

        if (!cameraOn) return;

        zoomLevel -= 0.1;

        if (zoomLevel < 1) {
            zoomLevel = 1;
        }

        updateZoom();

        playZoomSound(
            "wide"
        );

    }
);


zoomTele.addEventListener(
    "click",
    () => {

        if (!cameraOn) return;

        zoomLevel += 0.1;

        if (zoomLevel > 2) {
            zoomLevel = 2;
        }

        updateZoom();

        playZoomSound(
            "tele"
        );

    }
);


// =========================================================
// APPLY ZOOM
// =========================================================

function updateZoom() {

    memoryImage.style.transform =
        `scale(${zoomLevel})`;
}


// =========================================================
// PLAYBACK BUTTON
// =========================================================

const playbackButton =
    document.querySelector(
        ".playback"
    );

playbackButton.addEventListener(
    "click",
    () => {

        if (!cameraOn) return;

        playbackIndicator.classList.add(
            "visible"
        );

        setTimeout(
            () => {

                playbackIndicator.classList.remove(
                    "visible"
                );

            },
            1200
        );

        playTone(
            900,
            0.05,
            0.03,
            "sine"
        );
    }
);
