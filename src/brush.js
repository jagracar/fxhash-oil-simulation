import { Bristle } from './bristle.js';


// The maximum bristle length
const MAX_BRISTLE_LENGTH = 15;

// The maximum bristle thickness
const MAX_BRISTLE_THICKNESS = 5;

// The maximum noise range to add in each update to the bristles horizontal position on the brush
const MAX_BRISTLE_HORIZONTAL_NOISE = 8;

// The noise range to add to the bristles vertical position on the brush
const BRISTLE_VERTICAL_NOISE = 8;

// Controls the bristles horizontal noise speed
const NOISE_SPEED_FACTOR = 0.04;

// The number of positions to use to calculate the brush average position
const POSITIONS_FOR_AVERAGE = 5;


//
// This class simulates a brush composed of several bristles
//
export class Brush {

    //
    // Initializes the class
    //
    constructor(position, size, pg) {
        // Save the brush position and the graphics instance
        this.position = position.copy();
        this.pg = pg;

        // Initialize the variables used to calculate the average brush position
        this.averagePosition = position.copy();
        this.positionsHistory = [position.copy()];
        this.updatesCounter = 1;

        // Initialize the variables with the brush direction angle information
        this.directionAngle = 0;
        this.bristlesRotationSign = 1;

        // Calculate some of the bristles properties
        this.nBristles = Math.floor(size * pg.random(1.1, 1.3));
        this.bristlesHorizontalNoise = Math.min(0.3 * size, MAX_BRISTLE_HORIZONTAL_NOISE);
        this.bristlesHorizontalNoiseSeed = pg.random(1000);

        // Initialize the bristles arrays
        const bristlesLength = Math.min(size, MAX_BRISTLE_LENGTH);
        const bristlesThickness = Math.min(0.8 * bristlesLength, MAX_BRISTLE_THICKNESS);
        this.bOffsets = [];
        this.bPositions = [];
        this.bristles = [];

        for (let i = 0; i < this.nBristles; i++) {
            const horizontalOffset = size * pg.random(-0.5, 0.5);
            const verticalOffset = BRISTLE_VERTICAL_NOISE * pg.random(-0.5, 0.5);
            this.bOffsets[i] = pg.createVector(horizontalOffset, verticalOffset);
            this.bPositions[i] = pg.createVector(0);
            this.bristles[i] = new Bristle(pg.createVector(0), bristlesLength, bristlesThickness);
        }
    }

    //
    // Moves the brush to a new position
    //
    move(position) {
        // Update the brush position
        this.position.set(position);

        // Reset all the average position related variables
        this.averagePosition.set(position);
        this.positionsHistory = [position.copy()];
        this.updatesCounter = 1;

        // Reset all the direction angle information variables
        this.directionAngle = 0;
        this.bristlesRotationSign = 1;
    }

    //
    // Updates the brush properties
    //
    update(position, updateBristleElements) {
        // Return if the position didn't change enough
        if (this.position.dist(position) < 0) {
            return;
        }

        // Update the brush position
        this.position.set(position);

        // Add the new position to the positions history
        if (this.updatesCounter < POSITIONS_FOR_AVERAGE) {
            this.positionsHistory[this.updatesCounter] = position.copy();
        } else {
            this.positionsHistory[this.updatesCounter % POSITIONS_FOR_AVERAGE].set(position);
        }

        // Increase the updates counter
        this.updatesCounter++;

        // Calculate the new average position
        const previousAveragePosition = this.averagePosition.copy();
        this.averagePosition.set(0, 0);

        for (const pos of this.positionsHistory) {
            this.averagePosition.add(pos);
        }

        this.averagePosition.div(this.positionsHistory.length);

        // Calculate the new brush direction angle
        const previousDirectionAngle = this.directionAngle;
        this.directionAngle = Math.atan2(
            this.averagePosition.y - previousAveragePosition.y,
            this.averagePosition.x - previousAveragePosition.x);

        // Change the bristles rotation sign if there was a sharp change in the brush direction
        const cosDirectionAngleChange = (
            Math.cos(this.directionAngle) * Math.cos(previousDirectionAngle) +
            Math.sin(this.directionAngle) * Math.sin(previousDirectionAngle));

        if (cosDirectionAngleChange < 0.3) {
            this.bristlesRotationSign *= -1;
        }

        // Check if there are enough positions to update the bristles
        if (this.updatesCounter >= POSITIONS_FOR_AVERAGE) {
            // Calculate the bristle positions
            this.calculateBristlePositions();

            // Check if the bristle elements should be updated
            if (updateBristleElements) {
                // Move or update the bristles
                if (this.updatesCounter === POSITIONS_FOR_AVERAGE) {
                    for (let i = 0; i < this.nBristles; i++) {
                        this.bristles[i].move(this.bPositions[i]);
                    }
                } else {
                    for (let i = 0; i < this.nBristles; i++) {
                        this.bristles[i].update(this.bPositions[i]);
                    }
                }
            }
        }
    }

    //
    // Calculates the bristle positions
    //
    calculateBristlePositions() {
        // Loop over the bristles and calculate their current positions
        const cos = Math.cos(this.bristlesRotationSign * 0.5 * Math.PI + this.directionAngle);
        const sin = Math.sin(this.bristlesRotationSign * 0.5 * Math.PI + this.directionAngle);
        const noisePos = this.bristlesHorizontalNoiseSeed + NOISE_SPEED_FACTOR * this.updatesCounter;

        for (let i = 0; i < this.nBristles; i++) {
            // Add some noise to make it look more realistic
            const offset = this.bOffsets[i];
            const x = offset.x + this.bristlesHorizontalNoise * (this.pg.noise(noisePos + 0.1 * i) - 0.5);
            const y = offset.y;

            // Rotate the offset vector and add it to the brush position
            this.bPositions[i].set(this.position.x + (x * cos - y * sin), this.position.y + (x * sin + y * cos));
        }
    }

    //
    // Returns the bristles positions
    //
    getBristlePositions() {
        if (this.updatesCounter >= POSITIONS_FOR_AVERAGE) {
            return this.bPositions;
        }

        return;
    }

    //
    // Paints the brush on the canvas
    //
    paint(colors) {
        if (this.updatesCounter >= POSITIONS_FOR_AVERAGE) {
            for (let i = 0; i < this.nBristles; i++) {
                this.pg.stroke(colors[i])
                this.bristles[i].paint(this.pg);
            }
        }
    }
}
