const camera = document.querySelector(".camera");
const powerButton = document.querySelector(".power-button");

let cameraOn = false;
let starting = false;

powerButton.addEventListener("click", () => {

    if (starting) return;

    // Turn camera OFF
    if (cameraOn) {

        cameraOn = false;

        camera.classList.remove("camera-on");

        return;
    }


    // Start camera

    starting = true;

    camera.classList.add("camera-starting");


    setTimeout(() => {

        camera.classList.remove("camera-starting");

        camera.classList.add("camera-on");

        cameraOn = true;

        starting = false;

    }, 1500);

});
const shutterButton = document.querySelector(".shutter-button");

let photoNumber = 0;

shutterButton.addEventListener("click", () => {

    // Camera must be ON
    if (!cameraOn) return;

    photoNumber++;

    const focusBox = document.querySelector(".focus-box");

    // Focus
    focusBox.style.transform = "scale(1.15)";
    focusBox.style.borderColor = "#00ff66";

    setTimeout(() => {

        // Simulate shutter
        camera.classList.add("taking-photo");

        setTimeout(() => {

            camera.classList.remove("taking-photo");

            focusBox.style.transform = "scale(1)";
            focusBox.style.borderColor = "rgba(255,255,255,0.8)";

        }, 150);

    }, 400);

});
