import * as game from './game.js';

export class Environment {
    constructor() {
        this.targetTube = -1;
        this.targetTubeIndex = -1;
        this.episodeFrameCount = 0;
    }

    getState() {
        return [
            game.birdYSpeed, // Speed Y
            this.targetTube.x, // Tube X
            (this.targetTube.y + 17 + 6) - (game.birdY + 1), // Difference Y
            game.birdY // Bird Y
        ];
    }

    getInformation(action) {
        // Default reward
        var reward = 0;

        // Tolerable deviation from the ideal passage position between the tubes in px
        var theta = 1;

        // Logic to determine if the Flappy Bird successfully surpassed the tube The
        // changing of the targetTubeIndex denotes the completion of an episode
        if (game.birdX < game.tubes[0].x + 3 && (game.tubes[0].x < game.tubes[1].x || game.tubes[1].x + 3 < game.birdX)) {
            this.targetTube = game.tubes[0];
            if (this.targetTubeIndex == 1) {
                // The target tube changed from [1] to [0], which means the tube[1] was
                // crossed successfully Hence reward the bird positively 
                //rewardTheBird(5, true);
                reward = 5;
            }
            this.targetTubeIndex = 0;
        } else {
            this.targetTube = game.tubes[1];
            if (this.targetTubeIndex == 0) {
                // The target tube changed from index [0] to [1], which means the tube[0]
                // was crossed successfully Hence reward the bird positively
                //rewardTheBird(5, true);
                reward = 5;
            }
            this.targetTubeIndex = 1;
        }

        // We'll take no action if the  tube is too far from the bird
        /*if (this.targetTube.x - birdX > 28) {
            return;
        }*/

        var state = this.getState();

        var isDone = game.gameState == game.GAME_OVER;

        var diffY = state[2];

        if (!isDone)
            reward = reward - Math.abs(diffY); // Reward - State.diffY
        else {
            reward = 100;

            if (diffY >= theta && action == game.actionSet.JUMP) {
                // If the bird was above the ideal passage position and it still decided
                // to jump, reward negatively
                reward = -reward;
            } else if (diffY <= -theta && action == game.actionSet.STAY) {
                // If the bird was below the ideal passage position and it still decided
                // to not jump (stay), reward negatively
                reward = -reward;
            } else {
                // The bird took the right decision, so don't award it negatively
                reward = +0.5;
            }
        }
		
        document.getElementById("p1").innerHTML = (Math.round(state[0] * 100) / 100).toFixed(2);
        document.getElementById("p2").innerHTML = state[1];
        document.getElementById("p3").innerHTML = state[2];
        document.getElementById("p4").innerHTML = state[3];
        document.getElementById("p5").innerHTML = reward;
        document.getElementById("p6").innerHTML = isDone;

        return [state, reward, isDone];
    }

    reset() {
        game.resetGame();
        game.handleUserInteraction(game.HOME);

        this.targetTubeIndex = -1;
        this.episodeFrameCount = 0;

        return this.getInformation(-1);
    }

    step(action) {
        if (action == game.actionSet.JUMP) {
            game.handleUserInteraction(game.GAME);
        }

        // Making one step in the game, then we'll extract the data from the bird
        game.loop();
        
        return this.getInformation(action);
    }
}