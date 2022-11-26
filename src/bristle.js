//
// This class simulates the movement of a bristle
//
export class Bristle {

    //
    // Initializes the class
    //
    constructor(headPosition, length, thickness) {
        // Set the bristle head position
        this.headPosition = headPosition.copy();

        // Fill the bristle link arrays
        const nLinks = Math.max(1, Math.floor(Math.sqrt(2 * length)));
        const thicknessDecrement = thickness / nLinks;
        this.positions = [];
        this.lengths = [];
        this.thicknesses = [];

        for (let i = 0; i < nLinks; i++) {
            this.positions[i] = headPosition.copy();
            this.lengths[i] = nLinks - i;
            this.thicknesses[i] = thickness - i * thicknessDecrement;
        }
    }

    //
    // Moves the bristle to a new position
    //
    move(headPosition) {
        // Set the new bristle head position
        this.headPosition.set(headPosition);

        // Set the new link positions
        for (const position of this.positions) {
            position.set(headPosition);
        }
    }

    //
    // Updates the bristle head and link positions
    //
    update(headPosition) {
        // Set the new head position
        this.headPosition.set(headPosition);

        // Update the link positions
        let previousPosition = this.headPosition;

        for (let i = 0; i < this.positions.length; i++) {
            const position = this.positions[i];
            const length = this.lengths[i];
            const angle = Math.atan2(previousPosition.y - position.y, previousPosition.x - position.x);
            position.x = previousPosition.x - length * Math.cos(angle);
            position.y = previousPosition.y - length * Math.sin(angle);
            previousPosition = position;
        }
    }

    //
    // Paints the bristle on the graphics
    //
    paint(pg) {
        // Paint the bristle links
        let previousPosition = this.headPosition;

        for (let i = 0; i < this.positions.length; i++) {
            const position = this.positions[i];
            pg.strokeWeight(this.thicknesses[i]);
            pg.line(previousPosition.x, previousPosition.y, position.x, position.y);
            previousPosition = position;
        }
    }
}
