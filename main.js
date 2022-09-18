window.onload = function () {
    const settings = {
        fps: 60,
        screen: { width: 440, height: 620 },
        colors: {
            heroe: "#314369",
            background: "#D5D2B4",
            hub: "#CD6961",
            platform: "#314369",
            peakPlafom: "#93272c",
            wall: "#93272c",
            wallLines: "#D5D2B4",
            star: " #CD6961",
            dialogBg: "#da291c",
            dialogText: "#D5D2B4"
        },
        gravity: 0.5,
        acceleration: 0.2,
        platforms:10,
        posXPlatform: [24, 170, 326, 100, 246, 141, 283, 51, 220],
        initPosYPlatform: 300,
        limitPeakPlatform: 3,
        initialVelocity: 1.3,
        increment: 0.004  ,
        startRespawn: 20
    }

    let link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', 'https://fonts.googleapis.com/css?family=Rubik+Mono+One&display=swap');
    document.head.appendChild(link);
    document.querySelector("body").innerHTML = `<canvas width=${settings.screen.width} height=${settings.screen.height} id='game'>`;

    const canvas = document.querySelector('#game');
    const ctx = canvas.getContext('2d');

    let initScreen = {
        x: settings.screen.width / 2 - (100 / 2),
        y: settings.initPosYPlatform - 200,
        height: 60,
        width: 120
    }

    let gameOverScreen = {
        x: (settings.screen.width / 2) - 120,
        y: (settings.screen.height / 2) - 80,
        height: 160,
        width: 240
    }

    let key = {
        right: false,
        left: false
    }

    let heroe = {
        x: 320,
        y: 10,
        radius: 10,
        collide: false,
        gSpeed: 0,
        vx: 0
    };

    let peaksPlatforms = { exist: 0, limit: settings.limitPeakPlatform }

    let walls = {
        left: {
            x: 0,
            y: 0,
            height: canvas.height,
            width: 20
        },
        right: {
            x: canvas.width - 20,
            y: 0,
            height: canvas.height,
            width: 20
        }
    }

    let star = {
        x: 50,
        y: 100,
        width: 10,
        height: 10,
        radius: 6,
        active: false
    }

    let platformsArr = [];
    let wallLinesArr = [];
    let velocityLevel = settings.initialVelocity;
    let play = false;
    let score = 0;
    let gameover = false;

    const utils = {
        getPosXPlatform() {
            return settings.posXPlatform[Math.floor(Math.random() * settings.posXPlatform.length)];
        },
        zeroPad(value, size) {
            var s = String(value);
            while (s.length < (size || 2)) { s = "0" + s; }
            return s;
        },
        collide(e1, e2) {
            if (e1.x < e2.x + e2.width &&
                e1.x + e1.radius > e2.x &&
                e1.y < e2.y + e2.height &&
                e1.radius + e1.y > e2.y) {
                return true;
            } else {
                return false;
            }
        }
    }

    createLevel();
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    setInterval(update, 1000 / settings.fps);

    function createLevel() {
        for (let i = 0; i < settings.platforms; i++) {
            let posX = utils.getPosXPlatform();
            if (i > 0) {
                while (posX === platformsArr[i - 1].x) {
                    posX = utils.getPosXPlatform();
                }
            }
            platformsArr.push({
                type: 1,
                y: (60 * i) + settings.initPosYPlatform,
                x: posX,
                height: 20,
                width: 90,
                direction: 1
            })
        }
        for (let i = 1; i < 7; i++) {
            wallLinesArr.push({
                y: 100 * i
            })
        }
        heroe.x = platformsArr[0].x + (platformsArr[0].width / 2);
    }

    function resetLevel() {
        score = 0;
        velocityLevel = settings.initialVelocity;
        for (let i = 0; i < platformsArr.length; i++) {
            let posX = utils.getPosXPlatform();
            if (i > 0) {
                while (posX === platformsArr[i - 1].x) {
                    posX = utils.getPosXPlatform();
                }
            }

            platformsArr[i].type = 1;
            platformsArr[i].y = (60 * i) + settings.initPosYPlatform;
            platformsArr[i].x = posX;
        }
        star.active = false;
        heroe.y = 20;
        heroe.x = platformsArr[0].x + (platformsArr[0].width / 2);
        gameover = false;
    }

    function keyDownHandler(e) {
        if (!play && !gameover) play = true;
        if (gameover && e.keyCode == 32) resetLevel();
        if (e.key == "Right" || e.key == "ArrowRight") {
            key.right = true;
        }
        else if (e.key == "Left" || e.key == "ArrowLeft") {
            key.left = true;
        }
    }

    function keyUpHandler(e) {
        heroe.vx = 0
        if (e.key == "Right" || e.key == "ArrowRight") {
            key.right = false;
        }
        else if (e.key == "Left" || e.key == "ArrowLeft") {
            key.left = false;
        }
    }

    function update(time) {
        velocityLevel += settings.increment;
        movement();
        collitons();
        render();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //Background
        ctx.fillStyle = settings.colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.closePath();

        //Platforms
        platformsArr.forEach(element => {
            if (element.type > 0) {
                ctx.fillStyle = settings.colors.platform;
                ctx.fillRect(element.x, element.y, element.width, element.height);
            } else {
                let pos = { x: element.x, y: element.y }
                ctx.fillStyle = settings.colors.peakPlafom;
                ctx.fillRect(pos.x, pos.y, element.width, element.height - 10);
                for (let i = 0; i < 9; i++) {
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(pos.x + 5, pos.y - 5);
                    ctx.lineTo(pos.x + 10, pos.y);
                    ctx.fill();
                    pos.x += 10;
                }
            }
        });

        //Star
        if (star.active) {
            ctx.fillStyle = settings.colors.star;
            ctx.save();
            ctx.beginPath();
            ctx.translate(star.x, star.y);
            ctx.moveTo(0, 0 - star.radius);
            ctx.rotate(Math.PI / 5);
            for (var i = 0; i < 5; i++) {
                ctx.rotate(Math.PI / 5);
                ctx.lineTo(0, 0 - (star.radius * 2));
                ctx.rotate(Math.PI / 5);
                ctx.lineTo(0, 0 - star.radius);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        //Heroe
        ctx.beginPath();
        ctx.arc(heroe.x, heroe.y, heroe.radius, 0, Math.PI * 2);
        ctx.fillStyle = settings.colors.heroe;
        ctx.fill();
        ctx.closePath();

        //Top Peaks
        let pos = { x: 0, y: 20 }
        ctx.fillStyle = settings.colors.peakPlafom;
        for (let i = 0; i < (canvas.width / 20) + 1; i++) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x - 10, pos.y + 10);
            ctx.lineTo(pos.x - 20, pos.y);
            ctx.fill();
            pos.x += 20;
        }

        //Bottom Peaks
        pos = { x: 0, y: canvas.height }
        for (let i = 0; i < (canvas.width / 20) + 1; i++) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x + 10, pos.y - 10);
            ctx.lineTo(pos.x + 20, pos.y);
            ctx.fill();
            pos.x += 20;
        }
        ctx.closePath();

        //Walls
        ctx.fillStyle = settings.colors.wall;
        ctx.fillRect(walls.right.x, walls.right.y, walls.right.width, walls.right.height);
        ctx.fillRect(walls.left.x, walls.left.y, walls.left.width, walls.left.height);

        //Walls lines
        ctx.strokeStyle = settings.colors.wallLines;
        for (let line of wallLinesArr) {
            ctx.moveTo(0, line.y);
            ctx.lineTo(20, line.y);
            ctx.stroke();
            ctx.moveTo(canvas.width - 20, line.y);
            ctx.lineTo(canvas.width, line.y);
            ctx.stroke();
        }
        ctx.closePath();

        //HUD
        ctx.fillStyle = settings.colors.hub;
        ctx.fillRect(0, 0, canvas.width, 20);
        ctx.closePath();
        ctx.fillStyle = settings.colors.background;
        ctx.font = "18px 'Rubik Mono One', sans-serif";
        ctx.fillText(utils.zeroPad(score, 6), 5, 15)

        //Initial Screen
        if (!play && !gameover) {
            ctx.fillStyle = settings.colors.dialogBg;
            ctx.fillRect(initScreen.x, initScreen.y, initScreen.width, initScreen.height);
            ctx.closePath();
            ctx.fillStyle = settings.colors.dialogText;
            ctx.moveTo(initScreen.x + 5, initScreen.y + 30);
            ctx.lineTo(initScreen.x + 30, initScreen.y + 10);
            ctx.lineTo(initScreen.x + 30, initScreen.y + 50);
            ctx.fill();
            ctx.fillRect(initScreen.x + 30, initScreen.y + 20, 20, 20);
            ctx.fillStyle = settings.colors.dialogText;
            ctx.moveTo((initScreen.x + initScreen.width) - 5, initScreen.y + 30);
            ctx.lineTo((initScreen.x + initScreen.width) - 30, initScreen.y + 10);
            ctx.lineTo((initScreen.x + initScreen.width) - 30, initScreen.y + 50);
            ctx.fill();
            ctx.fillRect((initScreen.x + initScreen.width) - 50, initScreen.y + 20, 20, 20);
        }

        //Game Over
        if (gameover && !play) {
            ctx.fillStyle = settings.colors.dialogBg;
            ctx.fillRect(gameOverScreen.x, gameOverScreen.y, gameOverScreen.width, gameOverScreen.height);
            ctx.closePath();
            ctx.fillStyle = settings.colors.background;
            ctx.font = "18px 'Rubik Mono One', sans-serif";
            ctx.fillText("score", (gameOverScreen.x + (gameOverScreen.width / 2) - 45), gameOverScreen.y + 23)
            ctx.font = "42px 'Rubik Mono One', sans-serif";
            ctx.fillText(utils.zeroPad(score, 6), (gameOverScreen.x + (gameOverScreen.width / 2) - 108), gameOverScreen.y + 65)
            ctx.fillStyle = settings.colors.background;
            ctx.font = "10px 'Rubik Mono One', sans-serif";
            ctx.fillText("record", (gameOverScreen.x + (gameOverScreen.width / 2) - 30), gameOverScreen.y + 90)
            ctx.font = "22px 'Rubik Mono One', sans-serif";
            ctx.fillText(utils.zeroPad(localStorage.getItem("highscore"), 6), (gameOverScreen.x + (gameOverScreen.width / 2) - 60), gameOverScreen.y + 115)
            ctx.font = "8px 'Rubik Mono One', sans-serif";
            ctx.fillText("press spacebar to play again", (gameOverScreen.x + (gameOverScreen.width / 2) - 95), gameOverScreen.y + 152);
        }
    }

    function movement() {
        if (play) moveLines();
        if (play) moveCube();
        if (play) moveStar();
        if (!heroe.collide && !gameover) {
            heroe.gSpeed += settings.gravity;
            heroe.y += heroe.gSpeed;
            if (play) score++;
        }
        if (key.right && play) heroe.vx += settings.acceleration;
        if (key.left && play) heroe.vx -= settings.acceleration;
        if (play) heroe.x += heroe.vx;
    }

    function moveLines() {
        for (let line of wallLinesArr) {
            (line.y < 20) ? line.y = canvas.height : line.y -= velocityLevel
        }
    }


    function moveCube() {
        platformsArr.forEach((element, i) => {
            element.y -= velocityLevel;
            if (element.y < -20) {
                if (platformsArr[i].type === 0) {
                    peaksPlatforms.exist--
                    platformsArr[i].type = 1;
                }
                if (peaksPlatforms.exist < peaksPlatforms.limit) {
                    let t = (Math.round(Math.random() * 2) === 1) ? 0 : 1;
                    platformsArr[i].type = t;
                    if (t === 0) peaksPlatforms.exist++;
                }
                let posX = utils.getPosXPlatform();
                let posUp = 0;
                (i > 0) ? posUp = platformsArr[i - 1].x : posUp = platformsArr[i * 1].x
                while (posX === posUp) {
                    posX = utils.getPosXPlatform();
                }
                element.x = posX;
                element.y = canvas.height + element.height

                if (element.type === 1 && !star.active && Math.round(Math.random() * settings.startRespawn) == 2) {
                    star.x = element.x + Math.round(Math.random() * element.width - star.radius);
                    star.y = element.y - star.radius - (star.radius / 2);
                    star.active = true;
                }
            }
        });
    }

    function moveStar() {
        if (star.active) star.y -= velocityLevel;
        if (star.y < 20) star.active = false;
    }

    function collitons() {
        for (let element of platformsArr) {
            if (utils.collide(heroe, element)) {
                heroe.collide = true;
                heroe.gSpeed = 0;
                heroe.y = element.y - heroe.radius;
                if (element.type == 0) {
                    gameOver();
                }
                break;
            } else {
                heroe.collide = false;
                if (play && (heroe.y > canvas.height - 20 || heroe.y < 20)) gameOver();
            }
        }
        if (utils.collide(heroe, star) && star.active) {
            star.active = false
            velocityLevel = settings.initialVelocity
        }

        if (utils.collide(heroe, walls.left)) {
            heroe.vx = 0
            heroe.x = walls.left.width;
        }
        if (utils.collide(heroe, walls.right)) {
            heroe.vx = 0
            heroe.x = walls.right.x - heroe.radius;
        }

    }

    function gameOver() {
        play = false;
        gameover = true;
        let record = localStorage.getItem("highscore");
        if (Number(record) < score) {
            localStorage.setItem("highscore", score)
        }
    }

}