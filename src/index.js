import p5 from 'p5';
import { Trace } from './trace.js';

// Fix the seed
const seed = ~~(fxrand() * 123456789);
//const seed = 42;

const sketch = (p) => {
    let pg;

    p.setup = () => {
        // Create the canvas
        const canvasSize = p.min(p.windowWidth, p.windowHeight);
        p.createCanvas(canvasSize, canvasSize);

        // Create the processing graphics where the traces will be painted
        pg = p.createGraphics(canvasSize, canvasSize);

        // Set the seed for the random number generators
        p.randomSeed(seed);
        p.noiseSeed(seed);
        pg.randomSeed(seed);
        pg.noiseSeed(seed);

        // Set the sketch main properties
        p.frameRate(60);
        pg.strokeCap(pg.SQUARE);
        pg.background(0, 0);
    };

    p.draw = () => {
        // Clean the background
        p.background(230);

        // Paint a trace on the processing graphics
        paintTrace();

        // Show the result on the canvas
        p.image(pg, 0, 0);

        // Print the frame rate
        //console.log(p.frameRate())
    };

    p.windowResized = () => {
        // Resize the canvas
        const canvasSize = p.min(p.windowWidth, p.windowHeight);
        p.resizeCanvas(canvasSize, canvasSize);

        // Resize the processing graphics
        pg.resizeCanvas(canvasSize, canvasSize);

        // Set the seed for the random number generators
        p.randomSeed(seed);
        p.noiseSeed(seed);
        pg.randomSeed(seed);
        pg.noiseSeed(seed);

        // Clean the graphics
        pg.background(0, 0);
    };

    function paintTrace() {
        // Calculate the trace step positions
        const nSteps = 80;
        const speed = 2;
        const initAngle = p.random(p.TWO_PI);
        const noiseSeed = p.random(1000);
        const position = p.createVector(
            p.random(0.1 * p.width, 0.9 * p.width),
            p.random(0.1 * p.height, 0.9 * p.height));
        const positions = [position.copy()];

        for (let i = 1; i < nSteps; i++) {
            const angle = initAngle + p.TWO_PI * (p.noise(noiseSeed + 0.007 * i) - 0.5);
            position.add(speed * p.cos(angle), speed * p.sin(angle));
            positions[i] = position.copy();
        }

        // Create the trace
        const brushSize = 50;
        const trace = new Trace(positions, brushSize, pg);

        // Calculate the brisle colors
        trace.calculateBristleColors(p.color(p.random(255), 0, 200));

        // Paint the trace
        trace.paint();
    }
};

const myp5 = new p5(sketch, window.document.body);
