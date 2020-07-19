//whoa, just noticed this no longer works (30-10-2015), tap once and it's immediate game over. Hope to fix this soon. apologies to all you  flap masters :D

//Entry for http://jams.gamejolt.io/lowrezjam2014/games
//sprite sheet : http://sakri.net/stuff/canvas/FlappyBird32x32Tall.png

/*var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        initGame();

    }
}, 10);*/

var gameTimeOut;

var bgLoc = { x: 0, y: 0, width: 32, height: 32 };
var groundLoc = { x: 0, y: 31, width: 35, height: 1 };
var instructionsLoc = { x: 6, y: 49, width: 17, height: 21 };
var gameOverLoc = { x: 6, y: 32, width: 21, height: 17 };
var birdLocs = [{ x: 32, y: 0, width: 5, height: 3 }, { x: 32, y: 3, width: 5, height: 3 }, { x: 32, y: 6, width: 5, height: 3 }];
var tubeLoc = { x: 0, y: 32, width: 6, height: 44 };
var hiscoreLoc = { x: 6, y: 70, width: 30, height: 10 };
var scoreLocs = [32, 9, 27, 32, 32, 32, 27, 41, 32, 41, 27, 50, 32, 50, 27, 59, 32, 59, 32, 18];

var flappyBirdSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAABQCAYAAACecbxxAAACY0lEQVRoge2XPW4CMRCF5yooLeegpIw4SZp0dBF34DBIKSMOkKQJUgpyBuQUyYIZv/mx1wsGraXR4vXu+Jv3Zheg59e3cM3YbqbH+Dl8BiIiujYUEVEHtZvPwm4+C01AERF9LB+On5uAas6+uKdG+27Oviafvu1mGlq0L40WoOLRFFR8HKFGqLuFau7pa/I91SRUk/aJjb4/vB+D3xivea/xrkMotOElA9r38r0K14y4wVuC6sYI5YY6RkNQpzFC3TTU02Ya1vtF+AqrcMnP6/0iWUvAuoXH5QQ/EXZY16N16R4din8FoHmcULqO50Pnzs5bUNKmfBMNNlaFQ8HzfaG0Y7Q5ylkOhRTwHNnmIlSxfaVHL1SsWBEUUo5bADdKbZKvrWEfggIWovNZ9qH3x6VChvKoxNclJapCeY5oc+2zBO2ybwgobb0alKTCVaHQRpaCWjHZUJYtsGKhmVX1HpeTwKH+wUwr+LoEZdhHyXUaVIVIlIJWpfDqKAXJyYfW9CTIIm1eqUg7Ceopo4/cRRYUdkpUE4qYMuDcnUD16amL2uesEqqTqfZ5IiOycvWFou6GHraJeXrkqlZdTdX/Et4tlMs+5QvZhCrpKV6UWOCA/2ZUxYqg0BPHq+XrTvVs1a1fnkhyVGFGn/VTqkkodPMQUFXti5PB5AKUES6oM+UcCuW8JvBwvBI81dWByYBCm+ZA5heU+w85Xtd6SpubfdgHKq5SmqOeM/uwApQ6d0KdjwGUKoHyK8X955ta6/yI7onniWJsmEoZVoj3I8USpQaAUmEGhbKsQHMElWWfEtZ6n6BfqpBLl8a8BXQAAAAASUVORK5CYII=";
var spriteSheetImage = new Image();
spriteSheetImage.src = flappyBirdSource;
var spriteSheetCanvas = document.createElement("canvas");
spriteSheetCanvas.width = spriteSheetImage.width;
spriteSheetCanvas.height = spriteSheetImage.height;
var spriteSheetContext = spriteSheetCanvas.getContext("2d");
spriteSheetContext.drawImage(spriteSheetImage, 0, 0);

var renderCanvas = document.createElement("canvas");
renderCanvas.width = renderCanvas.height = 32;
var renderContext = renderCanvas.getContext("2d");
renderContext.globalCompositeOperation = "destination-over";
var collisionCanvas = document.createElement("canvas");

export function drawSpriteSheetImage(context, locRect, x, y) {
    context.drawImage(spriteSheetImage, locRect.x, locRect.y, locRect.width, locRect.height, x, y, locRect.width, locRect.height);
}

export var canvas, context, gameState, score, groundX = 0, birdY, birdYSpeed, birdX = 5, birdFrame = 0, activeTube, tubes = [], collisionContext, scale, scoreLoc = { width: 5, height: 9 }, hiScore = 0;
export var HOME = 0, GAME = 1, GAME_OVER = 2, HI_SCORE = 3;

export var actionSet = {
    STAY: 0,
    JUMP: 1
};

export function initGame() {
    canvas = document.getElementById("gameCanvas");
    context = canvas.getContext("2d");
    scale = Math.floor(Math.min(window.innerHeight, window.innerWidth) / 32);
    canvas.width = scale * 32;
    canvas.height = scale * 32;
    canvas.style.left = window.innerWidth / 2 - (scale * 32) / 2 + "px";
    canvas.style.top = window.innerHeight / 2 - (scale * 32) / 2 + "px";
    window.addEventListener("keydown", handleUserInteraction, false);
    canvas.addEventListener('touchstart', handleUserInteraction, false);
    canvas.addEventListener('mousedown', handleUserInteraction, false);
    collisionCanvas.width = birdX + 8;
    collisionCanvas.height = 32;
    collisionContext = collisionCanvas.getContext("2d");
    collisionContext.globalCompositeOperation = "xor";
    startGame();
    //setInterval(loop, 40);
    //gameTimeOut = setTimeOut(loop, 40);
}

export function resetGame() {
    birdYSpeed = score = 0;
    birdY = 14;
    for (var i = 0; i < 2; i++) {
        tubes[i] = { x: Math.round(48 + i * 19) };
        setTubeY(tubes[i]);
    }

    gameState = GAME;
}

export function startGame() {
    //gameState = HOME;
    gameState = GAME;
    resetGame();
    /*birdYSpeed = score = 0;
    birdY = 14;
    for (var i = 0; i < 2; i++) {
        tubes[i] = { x: Math.round(48 + i * 19) };
        setTubeY(tubes[i]);
    }*/
}

export function loop() {
    switch (gameState) {
        case HOME: renderHome();
            break;
        case GAME: renderGame();
            break;
        case GAME_OVER: renderGameOver();
            //gameState = GAME;
            //startGame();
            break;
        case HI_SCORE: renderHiScore();
            break;
    }
}

export function handleUserInteraction(event) {
    switch (gameState) {
        case HOME: gameState = GAME;
            break;
        case GAME: birdYSpeed = -1.4;//"tap boost"
            break;
        case HI_SCORE: startGame();
            break;
    }

    /*if (event) {
        event.preventDefault();//stop propagation chain
    }*/
}

export function renderHome() {
    renderContext.clearRect(0, 0, 32, 32);
    drawSpriteSheetImage(renderContext, instructionsLoc, 32 - instructionsLoc.width - 1, 1);
    updateBirdHome();
    renderGround(true);
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
}

export function renderGame() {
    renderContext.clearRect(0, 0, 32, 32);
    collisionContext.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
    renderScore(score, renderScoreXGame, 1);
    renderGround(true);
    renderTubes();
    updateBirdGame();
    checkCollision();
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
}

export function renderGameOver() {
    renderContext.clearRect(0, 0, 32, 32);
    drawSpriteSheetImage(renderContext, gameOverLoc, 5, 7 - birdFrame);
    renderGround();
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
    if (++score % 8 == 0) {
        birdFrame++;//this is a quick hack to move the game over logo
        birdFrame %= 2;
    }
}

export function renderHiScore() {
    renderContext.clearRect(0, 0, 32, 32);
    drawSpriteSheetImage(renderContext, hiscoreLoc, 1, 5);
    renderScore(hiScore, renderScoreXHiScore, 16);
    renderGround();
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
}

export function renderToScale() {
    var i, data = renderContext.getImageData(0, 0, 32, 32).data;
    for (i = 0; i < data.length; i += 4) {
        context.fillStyle = "rgb(" + data[i] + "," + data[i + 1] + "," + data[i + 2] + ")";
        context.fillRect(((i / 4) % 32) * scale, Math.floor(i / 128) * scale, scale, scale);
    }
}

export function checkCollision() {
    if (birdX == tubes[activeTube].x + 6) {
        score++;
    }
    var collisionData = collisionContext.getImageData(birdX, birdY, 5, 3).data;
    var data = renderContext.getImageData(birdX, birdY, 5, 3).data;
    for (var i = 0; i < collisionData.length; i += 4) {
        if (collisionData[i + 3] != data[i + 3]) {
            /*gameState = GAME_OVER;
            if (score > hiScore) {
                hiScore = score + 0;
            }
            setTimeout(function () { gameState = HI_SCORE }, 2500);*/
            //resetGame();
            //handleUserInteraction(HOME);
            //gameState = GAME;

            gameState = GAME_OVER;
            break;
        }
    }
}

export function renderScore(score, xFunction, y) {
    var parts = score.toString().split("");
    var i, index, length = parts.length;
    for (var i = 0; i < length; i++) {
        index = parseInt(parts.pop()) * 2;
        scoreLoc.x = scoreLocs[index];
        scoreLoc.y = scoreLocs[index + 1];
        //drawSpriteSheetImage(renderContext, scoreLoc, 25 - 5 * i, 1);
        drawSpriteSheetImage(renderContext, scoreLoc, xFunction(i, length), y);
    }
}

export function renderScoreXGame(index, total) {
    return 25 - 5 * index;
}

export function renderScoreXHiScore(index, total) {
    return 12 + Math.floor((total / 2) * 5) - 5 * index;
}

export function renderGround(move) {
    if (move && --groundX < bgLoc.width - groundLoc.width) {
        groundX = 0;
    }
    drawSpriteSheetImage(renderContext, groundLoc, groundX, 31);
}

export function updateBirdHome() {
    drawSpriteSheetImage(renderContext, birdLocs[birdFrame], birdX, birdY);
    birdFrame++;
    birdFrame %= 3;
}

export function updateBirdGame() {
    birdY = Math.round(birdY + birdYSpeed);
    birdYSpeed += .25;//Gravity, change this to your likings
    if (birdY < 0) {
        birdY = 0;
        birdYSpeed = 0;
    }
    if (birdY + 3 > bgLoc.height) {
        birdY = 28;
        birdYSpeed = 0;
    }
    renderContext.save();
    collisionContext.save();
    renderContext.translate(birdX, birdY);
    collisionContext.translate(birdX, birdY);
    drawSpriteSheetImage(renderContext, birdLocs[birdFrame], 0, 0);
    drawSpriteSheetImage(collisionContext, birdLocs[birdFrame], 0, 0);
    renderContext.restore();
    collisionContext.restore();
    birdFrame++;
    birdFrame %= 3;
}

export function renderTubes() {
    var i, tube;
    activeTube = tubes[0].x < tubes[1].x ? 0 : 1;
    for (i = 0; i < 2; i++) {
        tube = tubes[i];
        if (--tube.x <= -6) {
            tube.x = 32;
            setTubeY(tube);
        }
        drawSpriteSheetImage(renderContext, tubeLoc, tube.x, tube.y);
        drawSpriteSheetImage(collisionContext, tubeLoc, tube.x, tube.y);
    }
}

export function setTubeY(tube) {
    tube.y = Math.floor(Math.random() * (bgLoc.height - tubeLoc.height));
}