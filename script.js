const camera = document.querySelector(".camera");
const powerButton = document.querySelector(".power-button");
const shutterButton = document.querySelector(".shutter-button");

let cameraOn = false;
let starting = false;
let photoNumber = 0;


// =========================
// MEMORY PHOTOS
// =========================

const memories = [
    "images/test-1.png"
    "images/test-2.png"
    "images/test-3.png"
];

const memoryImage = document.querySelector("#memory-image");


// =========================
// POWER BUTTON
// =========================

powerButton.addEventListener("click", () => {

    if (starting) return;

    // TURN CAMERA OFF

    if (cameraOn) {

        cameraOn = false;

        camera.classList.remove("camera-on");

        return;
    }


    // START CAMERA

    starting = true;

    camera.classList.add("camera-starting");


    setTimeout(() => {

        camera.classList.remove("camera-starting");

        camera.classList.add("camera-on");

        cameraOn = true;

        starting = false;

    }, 1500);

});


// =========================
// SHUTTER BUTTON
// =========================

shutterButton.addEventListener("click", () => {

    // Camera must be ON

    if (!cameraOn) return;

    const focusBox = document.querySelector(".focus-box");


    // FOCUS

    focusBox.classList.add("focused");


    // TAKE PHOTO

    setTimeout(() => {

        camera.classList.add("taking-photo");


        // Move to next photo

        photoNumber++;

        if (photoNumber >= memories.length) {
            photoNumber = 0;
        }


        // Display next photo

        if (memoryImage) {
            memoryImage.src = memories[photoNumber];
        }


        // Remove flash

        setTimeout(() => {

            camera.classList.remove("taking-photo");

            focusBox.classList.remove("focused");

        }, 150);

    }, 400);

});
