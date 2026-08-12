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
