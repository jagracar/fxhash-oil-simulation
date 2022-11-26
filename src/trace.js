import { Brush } from './brush.js';


//The brightness relative change range between the bristles colors
const BRIGHTNESS_RELATIVE_CHANGE = 0.1;

// The trajectory step when the color mixing starts
const MIX_STARTING_STEP = 10;

// The color mixing strength
const MIX_STRENGTH = 0.02;


//
// This class simulates the movement of a brush on the canvas
//
export class Trace {

    //
    // Initializes the class
    //
    constructor(positions, brushSize, pg) {
        // Save the trace positions and the graphics instance
        this.positions = positions;
        this.pg = pg;

        // Initialize the trace main properties
        this.brush = new Brush(positions[0], brushSize, pg);
        this.nSteps = positions.length;
        this.nBristles = this.brush.nBristles;
        this.bristleColors = undefined;
        this.alphas = [];

        // Fill the alphas array
        const alphaDecrement = Math.min(Math.floor(255 / this.nSteps), 25);

        for (let i = 0; i < this.nSteps; i++) {
            this.alphas[i] = 255 - alphaDecrement * i;
        }
    }

    //
    // Calculates the bristles colors along the trace trajectory
    //
    calculateBristleColors(color) {
        // Initialize the bristle colors array
        this.bristleColors = [];

        // Set the color mode to HSB
        this.pg.colorMode(this.pg.HSB, 360, 100, 100, 1);

        // Calculate the initial bristle colors
        const intialColors = [];
        const hue = this.pg.hue(color);
        const saturation = this.pg.saturation(color);
        const brightness = this.pg.brightness(color);
        const alpha = this.alphas[0] / 255;
        const noiseSeed = this.pg.random(1000);

        for (let i = 0; i < this.nBristles; i++) {
            const deltaBrightness = BRIGHTNESS_RELATIVE_CHANGE * brightness * (this.pg.noise(noiseSeed + 0.4 * i) - 0.5);
            intialColors[i] = this.pg.color(hue, saturation, this.pg.constrain(brightness + deltaBrightness, 0, 100), alpha);
        }

        // Set the color mode to RGB again
        this.pg.colorMode(this.pg.RGB, 255);

        // Move the brush to the trace initial position
        this.brush.move(this.positions[0]);

        // Set the first step bristle colors to the initial colors
        this.bristleColors[0] = intialColors;

        // Calculate the bristle colors for each trace step
        const pixelDensity = this.pg.displayDensity();
        const width = this.pg.width;
        const height = this.pg.height;
        this.pg.loadPixels();

        for (let i = 1; i < this.nSteps; i++) {
            // Move the brush
            this.brush.update(this.positions[i], false);

            // Start setting the bristle colors to their previous colors with updated alpha
            const previousColors = this.bristleColors[i - 1];
            const colors = [];

            for (let j = 0; j < this.nBristles; j++) {
                colors[j] = this.pg.color(
                    this.pg.red(previousColors[j]),
                    this.pg.green(previousColors[j]),
                    this.pg.blue(previousColors[j]),
                    this.alphas[i]);
            }

            // Check if the colors should be mixed
            if (i >= MIX_STARTING_STEP) {
                // Get the bristle positions
                const positions = this.brush.getBristlePositions();

                // Make sure the postions are defined
                if (positions) {
                    // Loop over the bristles
                    for (let j = 0; j < this.nBristles; j++) {
                        // Make sure the bristle falls on the graphics
                        const position = positions[j];
                        const x = Math.round(position.x);
                        const y = Math.round(position.y);

                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            // Check that the pixel under the bristle has been painted
                            // For that the alpha value should not be zero
                            const loc = 4 * (x + y * width * pixelDensity) * pixelDensity;

                            if (this.pg.pixels[loc + 3] > 0) {
                                // Mix the previous color with the painted color
                                const color = colors[j];
                                colors[j] = this.pg.color(
                                    this.pg.lerp(this.pg.red(color), this.pg.pixels[loc], MIX_STRENGTH),
                                    this.pg.lerp(this.pg.green(color), this.pg.pixels[loc + 1], MIX_STRENGTH),
                                    this.pg.lerp(this.pg.blue(color), this.pg.pixels[loc + 2], MIX_STRENGTH),
                                    this.alphas[i]);
                            }
                        }
                    }
                }
            }

            this.bristleColors[i] = colors;
        }
    }

    //
    // Paints the trace on the graphics
    //
    paint() {
        // Move the brush to the trace initial position
        this.brush.move(this.positions[0]);

        // Loop over the trace positions
        for (let i = 1; i < this.nSteps; i++) {
            // Move the brush
            this.brush.update(this.positions[i], true);

            // Paint the brush on the screen
            this.brush.paint(this.bristleColors[i]);
        }
    }
}
