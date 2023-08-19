let coordinatesArray = [];

// Get the canvas element and its context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function drawCanvas() {

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find the maximum and minimum coordinates to determine canvas dimensions
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let minY = Infinity;

    for (const coord of coordinatesArray) {
        const x = coord[0];
        const y = coord[1];
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
    }

    // Calculate canvas width and height based on maximum and minimum coordinates
    const canvasWidth = maxX - minX * 3; // Add some padding for labels
    const canvasHeight = maxY - minY * 3;

    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;


    // Translate coordinates to fit within the canvas
    ctx.translate(-minX + 20, -minY + 25);

    // Draw the area on the canvas
    ctx.beginPath();
    ctx.moveTo(coordinatesArray[0][0], coordinatesArray[0][1]);
    for (let i = 1; i < coordinatesArray.length; i++) {
        ctx.lineTo(coordinatesArray[i][0], coordinatesArray[i][1]);
    }
    ctx.closePath();
    ctx.lineWidth = 5
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Visualize each point as a black dot with labels
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";

    for (const coord of coordinatesArray) {
        ctx.beginPath();
        ctx.arc(coord[0], coord[1], 10, 0, Math.PI * 2);
        ctx.fill();
        const text = `${coord[2]}(${coord[0]},${coord[1]})`
        ctx.fillText(text, coord[0] + 20, coord[1] + 25);
    }

    //making a center dot
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    const text = `(0,0)`
    ctx.fillText(text, 0 + 20, 0 + 10);
}


function drawExplosion(x, y) {
    const maxRadius = 10; // Maximum radius for the explosion circles

    let currentRadius = 1; // Starting radius
    let shockwaveStrength = 10;
    let debris = [];

    const explosionInterval = setInterval(() => {
        if (currentRadius >= maxRadius) {
            clearInterval(explosionInterval);
            return;
        }

        ctx.clearRect(x - maxRadius, y - maxRadius, maxRadius * 2, maxRadius * 2);
        ctx.beginPath();

        ctx.fillStyle = 'green'
        ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        currentRadius += 2; // Increase radius for the next circle

        // Add shockwave
        ctx.strokeStyle = 'lightgreen';
        ctx.beginPath();
        ctx.arc(x, y, currentRadius + shockwaveStrength, 0, Math.PI * 2);
        ctx.stroke();

        // Add debris
        debris.push({
            x: x + Math.random() * 100,
            y: y + Math.random() * 100,
            radius: Math.random() * 10,
            speed: Math.random() * 10,
            direction: Math.random() * Math.PI * 2,
        });

        for (let i = 0; i < debris.length; i++) {
            debris[i].x += debris[i].speed * Math.cos(debris[i].direction);
            debris[i].y += debris[i].speed * Math.sin(debris[i].direction);

            // Remove debris that goes off the screen
            if (debris[i].x < 0 || debris[i].x > window.innerWidth || debris[i].y < 0 || debris[i].y > window.innerHeight) {
                debris.splice(i, 1);
                i--;
            }
        }
    }, 50); // Time interval between drawing circles
}

function drawBombs(numOfBombers, stdDevX, stdDevY) {
    clearRows() //clear the previous inputs
    // Simulate the bombing operation
    let numHits = 0;
    for (let squadron = 1; squadron <= numOfBombers; squadron++) {
        // for (let bomber = 1; bomber <= numBombersPerSquadron; bomber++) {

        const rnnX = generateRandomNormal().toFixed(2)
        const rnnY = generateRandomNormal().toFixed(2)

        const randomX = (stdDevX * rnnX).toFixed(0);
        const randomY = (stdDevY * rnnY).toFixed(0);

        const hitOrMiss = isInsideArea(randomX, randomY, coordinatesArray) ? 'Hit' : 'Miss'

        if (isInsideArea(randomX, randomY, coordinatesArray)) {
            numHits++;
            // ctx.beginPath();
            ctx.fillStyle = 'green'
            // ctx.arc(randomX, randomY, 10, 0, Math.PI * 2);
            // ctx.fill();
            drawExplosion(randomX, randomY)
            const text = `(${randomX},${randomY})`
            // console.log('text is', text)
            ctx.fillText(text, randomX, randomY);
        }
        else {
            ctx.beginPath();
            ctx.fillStyle = 'red'
            ctx.arc(randomX, randomY, 10, 0, Math.PI * 2);
            ctx.fill();
            const text = `(${randomX},${randomY})`
            ctx.fillText(text, randomX, randomY);
        }

        addBomber(squadron, rnnX, randomX, rnnY, randomY, hitOrMiss) //finally add the entries in the table
    }

    // Calculate the percentage of hits
    // const hitPercentage = (numHits / numOfBombers) * 100;
}

//HELPER FUNCTIONS
function clearRows() {
    console.log(document.querySelector("#Btbody").innerHTML)
    document.querySelector("#Btbody").innerHTML = ""
}

// Function to check if a point is inside the area
/**
 * The function checks if a given point (x, y) is inside a polygon defined by an array of coordinates.
 * 
 * @param x The x-coordinate of the point you want to check if it is inside the area.
 * @param y The parameter `y` represents the y-coordinate of a point.
 * 
 * @return a boolean value indicating whether the given point (x, y) is inside the area defined by the
 * coordinatesArray.
 * 
 * this function still misses the edgecase, the coordinate should be strictly inside the polygon and it will not consider its 
 * inside the polygon when the coordinates are on the edge or vertices exactly
 */
function isInsideArea(x, y) {
    let inside = false;
    for (let i = 0, j = coordinatesArray.length - 1; i < coordinatesArray.length; j = i++) {
        const xi = coordinatesArray[i][0];
        const yi = coordinatesArray[i][1];
        const xj = coordinatesArray[j][0];
        const yj = coordinatesArray[j][1];

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < ((xj - xi) * (y - yi) / (yj - yi) + xi));
        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
}

// Function to generate a random normal variable using Box-Muller transform
function generateRandomNormal() {
    let u1, u2;
    do {
        u1 = Math.random();
        u2 = Math.random();
    } while (u1 === 0);

    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0;
}


function addBomber(index, rnX, x, rnY, y, result) {
    const tbody = document.querySelector('#Btbody')
    const tr = tbody.insertRow()

    tr.insertCell().appendChild(document.createTextNode(index))
    tr.insertCell().appendChild(document.createTextNode(rnX))
    tr.insertCell().appendChild(document.createTextNode(x))
    tr.insertCell().appendChild(document.createTextNode(rnY))
    tr.insertCell().appendChild(document.createTextNode(y))
    tr.insertCell().appendChild(document.createTextNode(result))
}

//on load execute the default simulation
document.addEventListener("DOMContentLoaded", function () {
    const coordinatesList = document.getElementById("coordinates-list");
    const addCoordinateBtn = document.getElementById("addCoordinate");

    // Default Area Coordinates
    const originalAreaCoordinates = [
        [-500, 0, "A"],
        [-125, 550, "B"],
        [276, 550, "C"],
        [276, 275, "D"],
        [750, 275, "E"],
        [276, -400, "F"],
        [-250, -400, "G"],
    ];

    // Create default coordinates
    originalAreaCoordinates.forEach(coord => {
        createCoordinateInput(coord[0], coord[1], coord[2]);
    });

    addCoordinateBtn.addEventListener("click", function () {
        createCoordinateInput("", "", "");
    });

    function createCoordinateInput(xValue, yValue, labelValue) {
        const coordinateItem = document.createElement("div");
        coordinateItem.classList.add("coordinate-item");

        const xLabel = document.createElement("label");
        xLabel.textContent = "X Coordinate:";
        const xInput = document.createElement("input");
        xInput.type = "number";
        xInput.step = "any";
        xInput.required = true;
        xInput.value = xValue;

        const yLabel = document.createElement("label");
        yLabel.textContent = "Y Coordinate:";
        const yInput = document.createElement("input");
        yInput.type = "number";
        yInput.step = "any";
        yInput.required = true;
        yInput.value = yValue;

        const labelLabel = document.createElement("label");
        labelLabel.textContent = "Label:";
        const labelInput = document.createElement("input");
        labelInput.type = "text";
        labelInput.required = true;
        labelInput.value = labelValue;

        const deleteBtn = document.createElement("span");
        deleteBtn.classList.add("delete-coordinate");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", function () {
            coordinatesList.removeChild(coordinateItem);
        });

        coordinateItem.appendChild(xLabel);
        coordinateItem.appendChild(xInput);
        coordinateItem.appendChild(yLabel);
        coordinateItem.appendChild(yInput);
        coordinateItem.appendChild(labelLabel);
        coordinateItem.appendChild(labelInput);
        coordinateItem.appendChild(deleteBtn);

        coordinatesList.appendChild(coordinateItem);
    }


    coordinatesArray = getAllCoordinates()
    const stdDevs = getStdDeviations()

    drawCanvas(coordinatesArray)
    drawBombs(10, stdDevs.x, stdDevs.y)
    updateHeaderValues(stdDevs.x, stdDevs.y)


});


function getAllCoordinates() {
    const coordinateItems = document.querySelectorAll(".coordinate-item");
    const result = [];
    // console.log(coordinateItems)
    coordinateItems.forEach(item => {
        const xInput = item.querySelectorAll('input[type="number"]')[0];
        const yInput = item.querySelectorAll('input[type="number"]')[1];
        // const xInput = item.children[1]
        // const yInput = item.children[3]
        const labelInput = item.querySelector('input[type="text"]');
        if (xInput.value && yInput.value && labelInput.value) {
            result.push([parseFloat(xInput.value), parseFloat(yInput.value), labelInput.value]);
        }
    });
    return result;
}


document.querySelector('#simulateButton').addEventListener('click', simulate)


function simulate() {
    coordinatesArray = getAllCoordinates() //update the coordinates
    const newStdDeviations = getStdDeviations()
    console.log('new stds are:', newStdDeviations)


    drawCanvas()
    drawBombs(10, newStdDeviations.x, newStdDeviations.y)
    updateHeaderValues(newStdDeviations.x, newStdDeviations.y)
}

function updateHeaderValues(stdX, stdY) {
    const stdXHeading = `x-Coordinate\n(RNNx * ${stdX})`
    const stdYHeading = `y-Coordinate\n(RNNy * ${stdY})`

    const tRow = document.querySelector('#bombersTable thead').children[0].children
    tRow[2].textContent = stdXHeading
    tRow[4].textContent = stdYHeading
}

function getStdDeviations() {
    const x = document.querySelector('#stdDevX').value
    const y = document.querySelector('#stdDevY').value

    // console.log(x, y)
    return { x, y }
}
