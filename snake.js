// snake.js
let animationFrame;
let lastTime = 0;

async function saveScore(score, game) {
    if (!window.PLAYER_NAME) return;

    const url = "https://edhdqozlowmybmmtaqng.supabase.co/rest/v1/scores";
    const key = "sb_publishable_ZjVEIJNRJ7Iw8IvHRvqv6w_udas_hdP";

    try {
        // cek data user + game
        const res = await fetch(`${url}?player_name=eq.${window.PLAYER_NAME}&game_type=eq.${game}`, {
            headers: {
                apikey: key,
                Authorization: `Bearer ${key}`
            }
        });

        const data = await res.json();

        if (data.length > 0) {
            // update kalau skor lebih tinggi
            if (score > data[0].score) {
                await fetch(`${url}?id=eq.${data[0].id}`, {
                    method: "PATCH",
                    headers: {
                        apikey: key,
                        Authorization: `Bearer ${key}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ score })
                });
            }
        } else {
            // insert baru
            await fetch(url, {
                method: "POST",
                headers: {
                    apikey: key,
                    Authorization: `Bearer ${key}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    player_name: window.PLAYER_NAME,
                    score,
                    game_type: game
                })
            });
        }

    } catch (err) {
        console.error("DB ERROR:", err);
    }
}

export function initSnakeGame() {
    const canvas = document.getElementById("mainCanvas");
    const ctx = canvas.getContext("2d");

    // Paksa ukuran canvas agar muncul
    canvas.width = 300;
    canvas.height = 300;

    const box = 20;
    let snake, d, nextD, food, score;
    let speed = 100;

    // --- FUNGSI EFEK SUARA ---
    function playEatSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Nada A5

            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
            console.log("Audio tidak dapat diputar sebelum interaksi user");
        }
    }

    function resetGame() {
        snake = [{ x: 8 * box, y: 8 * box }];
        d = "RIGHT";
        nextD = "RIGHT";
        score = 0;
        updateScoreUI();
        spawnFood();
    }

    // --- FUNGSI SPAWN BUAH (Anti-Badan Ular) ---
    function spawnFood() {
        let newFood;
        let isOverlapping = true;

        while (isOverlapping) {
            newFood = {
                x: Math.floor(Math.random() * (canvas.width / box)) * box,
                y: Math.floor(Math.random() * (canvas.height / box)) * box
            };

            // Cek apakah koordinat baru menabrak salah satu bagian tubuh ular
            isOverlapping = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        }
        food = newFood;
    }

    function updateScoreUI() {
        const scoreEl = document.getElementById('current-score');
        const highEl = document.getElementById('high-score');
        if (scoreEl) scoreEl.innerText = score;

        const high = localStorage.getItem('snake_high') || 0;
        if (highEl) highEl.innerText = high;
    }

    function checkHighScore() {
        const high = localStorage.getItem('snake_high') || 0;
        if (score > high) {
            localStorage.setItem('snake_high', score);
        }
    }

    // Kontrol Global (Mobile)
    window.setDir = (newD) => {
        if (newD === "LEFT" && d !== "RIGHT") nextD = "LEFT";
        else if (newD === "UP" && d !== "DOWN") nextD = "UP";
        else if (newD === "RIGHT" && d !== "LEFT") nextD = "RIGHT";
        else if (newD === "DOWN" && d !== "UP") nextD = "DOWN";
    };

    // KONTROL PC/LAPTOP (Keyboard)
    document.onkeydown = (e) => {
        if (e.key === "ArrowUp" || e.key === "w") setDir("UP");
        else if (e.key === "ArrowDown" || e.key === "s") setDir("DOWN");
        else if (e.key === "ArrowLeft" || e.key === "a") setDir("LEFT");
        else if (e.key === "ArrowRight" || e.key === "d") setDir("RIGHT");
    };

    function update(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const diff = timestamp - lastTime;

        if (diff > speed) {
            lastTime = timestamp;
            d = nextD;

            let hX = snake[0].x;
            let hY = snake[0].y;

            if (d === "UP") hY -= box;
            if (d === "DOWN") hY += box;
            if (d === "LEFT") hX -= box;
            if (d === "RIGHT") hX += box;

            // LOGIKA MAKAN
            if (hX === food.x && hY === food.y) {
                score++;
                playEatSound(); // Putar suara saat makan
                checkHighScore();
                updateScoreUI();
                spawnFood();
            } else {
                snake.pop();
            }

            // CEK TABRAKAN WALL / BADAN
            if (hX < 0 || hX >= 300 || hY < 0 || hY >= 300 || snake.some(s => s.x === hX && s.y === hY)) {

                saveScore(score, "snake"); // 🔥 KIRIM KE DB
                resetGame();
            } else {
                snake.unshift({ x: hX, y: hY });
            }
        }
        render();
        animationFrame = requestAnimationFrame(update);
    }

    function render() {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 300, 300);
        snake.forEach((p, i) => {
            ctx.fillStyle = i === 0 ? "#ec9e4a" : "#fff";
            ctx.fillRect(p.x + 1, p.y + 1, box - 2, box - 2);
        });
        ctx.fillStyle = "red";
        ctx.fillRect(food.x + 4, food.y + 4, box - 8, box - 8);
    }

    if (animationFrame) cancelAnimationFrame(animationFrame);
    resetGame();
    animationFrame = requestAnimationFrame(update);
}