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

const playbackIndicator = document.querySelector(".playback-indicator");

const zoomWide = document.querySelector(".zoom-wide");

const zoomTele = document.querySelector(".zoom-tele");


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


// =========================================================
// MEMORY PHOTOS
// =========================================================

const memories = [

    "images/test-1.png",

    "images/test-2.png",

    "images/test-3.png"

];


// Update total photo count

totalPhotos.textContent = memories.length;


// =========================================================
// SOUND SYSTEM
// =========================================================

let audioContext = null;


// Create audio context only after user interaction

function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    return audioContext;
}


// Simple beep

function playBeep(
    frequency = 800,
    duration = 0.08,
    volume = 0.05
) {

    const ctx = getAudioContext();

    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();


    oscillator.type = "sine";

    oscillator.frequency.value =
        frequency;


    gain.gain.setValueAtTime(
        volume,
        ctx.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
    );


    oscillator.connect(gain);

    gain.connect(ctx.destination);


    oscillator.start();

    oscillator.stop(
        ctx.currentTime + duration
    );
}


// Focus beep

function playFocusSound() {

    playBeep(
        1000,
        0.06,
        0.045
    );

}


// Shutter sound

function playShutterSound() {

    const ctx = getAudioContext();


    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();


    oscillator.type = "square";


    oscillator.frequency.setValueAtTime(
        180,
        ctx.currentTime
    );


    oscillator.frequency.exponentialRampToValueAtTime(
        75,
        ctx.currentTime + 0.12
    );


    gain.gain.setValueAtTime(
        0.08,
        ctx.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + 0.12
    );


    oscillator.connect(gain);

    gain.connect(ctx.destination);


    oscillator.start();

    oscillator.stop(
        ctx.currentTime + 0.12
    );

}


// Power sound

function playPowerSound() {

    playBeep(
        500,
        0.08,
        0.04
    );

    setTimeout(() => {

        playBeep(
            900,
            0.12,
            0.04
        );

    }, 90);

}


// =========================================================
// POWER BUTTON
// =========================================================

powerButton.addEventListener(
    "click",
    () => {

        if (starting) return;


        // Create audio context

        getAudioContext();


        // =========================================
        // TURN CAMERA OFF
        // =========================================

        if (cameraOn) {

            cameraOn = false;

            camera.classList.remove(
                "camera-on"
            );


            // Stop recording if active

            if (recording) {

                stopRecording();

            }


            playBeep(
                400,
                0.08,
                0.035
            );


            return;
        }


        // =========================================
        // START CAMERA
        // =========================================

        starting = true;

        camera.classList.add(
            "camera-starting"
        );


        playPowerSound();


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


                // Reset photo

                photoNumber = 0;

                memoryImage.src =
                    memories[photoNumber];


                updatePhotoCounter();


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

        // Camera must be on

        if (!cameraOn) return;


        // Prevent double-clicking

        if (takingPhoto) return;


        takingPhoto = true;


        // =========================================
        // FOCUS
        // =========================================

        focusBox.classList.add(
            "focused"
        );


        playFocusSound();


        // Focus lock

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


        // =========================================
        // TAKE PHOTO
        // =========================================

        setTimeout(
            () => {

                camera.classList.add(
                    "taking-photo"
                );


                camera.classList.add(
                    "camera-shake"
                );


                playShutterSound();


                // =================================
                // CHANGE PHOTO
                // =================================

                photoNumber++;


                if (
                    photoNumber >=
                    memories.length
                ) {

                    photoNumber = 0;

                }


                // Fade old image

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


                // =================================
                // CLEAN UP EFFECTS
                // =================================

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


                        // Battery usage

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


    // Camera automatically turns off

    if (battery === 0) {

        cameraOn = false;

        camera.classList.remove(
            "camera-on"
        );

        stopRecording();

    }

}


// =========================================================
// VIDEO / RECORDING BUTTON
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


    playBeep(
        700,
        0.08,
        0.04
    );


    recordingInterval =
        setInterval(
            () => {

                recordingSeconds++;


                updateRecordTime();


                // Small battery drain

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

    recording = false;


    camera.classList.remove(
        "recording"
    );


    clearInterval(
        recordingInterval
    );


    recordingInterval = null;


    playBeep(
        450,
        0.1,
        0.04
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

let zoomLevel = 1;


zoomWide.addEventListener(
    "click",
    () => {

        if (!cameraOn) return;


        zoomLevel -= 0.1;


        if (zoomLevel < 1) {

            zoomLevel = 1;

        }


        updateZoom();


        playBeep(
            650,
            0.04,
            0.025
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


        playBeep(
            800,
            0.04,
            0.025
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


        playBeep(
            900,
            0.05,
            0.03
        );

    }
);
