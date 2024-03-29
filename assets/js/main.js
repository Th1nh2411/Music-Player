
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const songName = $(".dashboard-playing__song");
const cd = $(".dashboard-cd");
const songAudio = $("#audio");
const playBtn = $(".btn.dashboard-controls__playbtn");
const preBtn = $(".btn:nth-child(2)");
const nextBtn = $(".btn:nth-child(4)");
const randomBtn = $(".btn:nth-child(5)");
const repeatBtn = $(".btn:nth-child(1)");
const progess = $(".progress");
const playlist = $(".playlist");

const app = {
    currentIndex: 0,
    isRandom: false,
    isRepeat: false,
    isPlaying: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Old Love",
            singer: "Yuji ft. Putri Dahlia",
            path: "./assets/music/song1.mp3",
            image: "./assets/img/song1.jpg",
        },
        {
            name: "Snowman",
            singer: "Sia",
            path: "./assets/music/song2.mp3",
            image: "./assets/img/song2.jpg",
        },
        {
            name: "Senorita",
            singer: "Camila Cabello & Shawn Mendes",
            path: "./assets/music/song3.mp3",
            image: "./assets/img/song3.jpg",
        },
        {
            name: "Psycho pt.2",
            singer: "Russ",
            path: "./assets/music/song4.mp3",
            image: "./assets/img/song4.jpg",
        },
        {
            name: "Peaches",
            singer: "Justin Bieber",
            path: "./assets/music/song5.mp3",
            image: "./assets/img/song5.jpg",
        },
        {
            name: "One Last Time",
            singer: "Ariana Grande",
            path: "./assets/music/song6.mp3",
            image: "./assets/img/song6.jpg",
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render() {
        var htmls = this.songs.map((song, index) => {
            return `
    <div class="song ${index === this.currentIndex ? " active" : ""
                } "data-index ="${index}">
    <div class="song-info ">
        <img src="${song.image}" class="song__thumb"></img>
        <div class="song__body">
            <h3 class="song-title">${song.name}</h3>
            <p class="song-author">${song.singer}</p>
        </div>
    </div>

    <div class="song__option">
        <i class="bi bi-three-dots"></i>
    </div>
</div>
`;
        });
        playlist.innerHTML = htmls.join("");
    },
    defineProperties() {
        Object.defineProperty(this, "currentSong", {
            get() {
                return this.songs[this.currentIndex];
            },
        });
    },
    handleEvents() {
        // Xử lí CD quay tròn
        const cdWidth = cd.offsetWidth;
        const cdAnimate = cd.animate(
            [
                {
                    transform: "rotate(360deg)",
                },
            ],
            {
                duration: 10000, // 10 second
                iterations: Infinity,
            }
        );
        cdAnimate.pause();

        // Xử lí khi scroll => phóng to/ thu nhỏ CD
        document.onscroll = function () {
            const scrollY = window.pageYOffset;
            const currentcdWidth = cdWidth - scrollY;

            cd.style.width = currentcdWidth > 0 ? currentcdWidth + "px" : 0;
            cd.style.height = cd.style.width;
            cd.style.opacity = currentcdWidth / cdWidth;
        };

        // Xử lí khi click play
        playBtn.onclick = () => {
            if (app.isPlaying) {
                songAudio.pause();
            } else {
                songAudio.play();
            }
        };

        // Xử lí bấm space => play/pause song
        document.onkeypress = (e) => {
            if (e.keyCode === 32) {
                if (app.isPlaying) {
                    songAudio.pause();
                } else {
                    songAudio.play();
                }
            }
        };

        // Xử lí click next
        nextBtn.onclick = () => {
            if (app.isRandom) {
                app.playRandomSong();
            } else {
                app.nextSong();
            }
            songAudio.play();
            cdAnimate.cancel();
            app.scrolltoActiveSong();
        };

        // Xử lí click pre song
        preBtn.onclick = () => {
            if (app.isRandom) {
                app.playRandomSong();
            } else {
                app.preSong();
            }
            cdAnimate.cancel();
            songAudio.play();
            app.scrolltoActiveSong();
        };

        // Random song
        randomBtn.onclick = () => {
            app.isRandom = !app.isRandom;
            app.setConfig("isRandom", app.isRandom);
            randomBtn.classList.toggle('active', app.isRandom);
        };

        // Repeat song
        repeatBtn.onclick = () => {
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
            repeatBtn.classList.toggle("active", app.isRepeat);
        };
        // Khi play song
        songAudio.onplay = () => {
            app.isPlaying = true;
            player.classList.add("playing");
            cdAnimate.play();
        };
        // Khi pause song
        songAudio.onpause = () => {
            app.isPlaying = false;
            player.classList.remove("playing");
            cdAnimate.pause();
        };

        // CurrentTime of player
        songAudio.ontimeupdate = () => {
            progess.value = songAudio.duration
                ? (songAudio.currentTime / songAudio.duration) * 100
                : 1;
        };

        // Xử lí tua song
        progess.onchange = () => {
            songAudio.currentTime = (progess.value / 100) * songAudio.duration;
        };

        // Khi audio ended
        songAudio.onended = () => {
            if (app.isRepeat) {
                songAudio.play();
            } else {
                nextBtn.click();
            }
        };

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = (e) => {
            const songNode = e.target.closest(".song:not(.active)");

            if (songNode) {
                app.currentIndex = Number(songNode.dataset.index);
                app.loadCurrentSong();
                app.render();
                songAudio.play();
            } else if (e.target.closest(".song__option")) {
                console.log("option");
            }
        };
    },
    loadConfig() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        randomBtn.classList.toggle('active', app.isRandom);
        repeatBtn.classList.toggle("active", app.isRepeat);
    },
    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        this.render();
    },
    preSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        this.render();
    },
    loadCurrentSong() {
        songName.textContent = this.currentSong.name;
        cd.style.backgroundImage = `url(${this.currentSong.image})`;
        songAudio.src = this.currentSong.path;
    },
    playRandomSong() {
        let RandomIndex = 0;
        do {
            RandomIndex = Math.floor(Math.random() * app.songs.length);
        } while (RandomIndex === this.currentIndex);
        this.currentIndex = RandomIndex;
        this.loadCurrentSong();
        this.render();
    },
    scrolltoActiveSong() {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: this.currentIndex === 0 ? "center" : "nearest",
            });
        }, 300);
    },
    start() {
        // Load config to web
        this.loadConfig()
        // Định nghĩa các thuộc tính
        this.defineProperties();

        // Load bài hát đầu tiên vào UI khi vào app
        this.loadCurrentSong();

        // Render bài hát
        this.render();

        // Xử lí các sự kiện người dùng
        this.handleEvents();
    },
};

app.start();
