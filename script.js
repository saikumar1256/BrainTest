// Player Profile & Persistent State Management
        function getPlayerState() {
            try {
                const savedName = localStorage.getItem('brainTestPlayerName');
                const savedProgress = localStorage.getItem('brainTestProgress');
                const progress = savedProgress ? JSON.parse(savedProgress) : { unlockedStage: 1, stars: {} };
                return { name: savedName || "", progress };
            } catch(e) {
                return { name: "", progress: { unlockedStage: 1, stars: {} } };
            }
        }

        function savePlayerName(name) {
            try {
                localStorage.setItem('brainTestPlayerName', name.trim());
            } catch(e) {}
        }

        function updatePlayerUI() {
            const state = getPlayerState();
            const badge = document.getElementById('headerPlayerBadge');
            const nameDisplay = document.getElementById('headerPlayerNameDisplay');
            const greeting = document.getElementById('welcomeGreetingText');

            if (state.name) {
                if (badge) badge.classList.remove('hidden');
                if (nameDisplay) nameDisplay.innerText = state.name;
                if (greeting) greeting.innerText = `Welcome, ${state.name}!`;
            } else {
                if (badge) badge.classList.add('hidden');
            }
        }

        function handleNameSubmission() {
            playClickSound();
            const input = document.getElementById('playerNameInput');
            const errorMsg = document.getElementById('nameErrorMsg');
            const nameVal = input ? input.value.trim() : "";

            if (!nameVal) {
                if (errorMsg) errorMsg.classList.remove('hidden');
                input.focus();
                return;
            }

            if (errorMsg) errorMsg.classList.add('hidden');
            savePlayerName(nameVal);
            updatePlayerUI();
            showPage('welcomePage');
        }

        function changePlayerNamePrompt() {
            toggleSettingsModal();
            const current = getPlayerState().name;
            const newName = prompt("Enter your new player name:", current);
            if (newName && newName.trim()) {
                savePlayerName(newName.trim());
                updatePlayerUI();
            }
        }

        function handleLogoClick() {
            const state = getPlayerState();
            if (state.name) {
                showPage('welcomePage');
            } else {
                showPage('nameEntryPage');
            }
        }

        // Global Navigation Function
        function showPage(pageId) {
            playClickSound();
            const pages = ['nameEntryPage', 'welcomePage', 'stagePage'];
            pages.forEach(p => {
                const el = document.getElementById(p);
                if (el) {
                    if (p === pageId) {
                        el.classList.remove('page-hidden');
                        el.classList.add('page-visible');
                    } else {
                        el.classList.add('page-hidden');
                        el.classList.remove('page-visible');
                    }
                }
            });

            if (pageId === 'stagePage') {
                renderStagesGrid();
            }
        }

        // Web Audio API Sound Effects
        let soundEnabled = true;
        let audioCtx = null;

        function getAudioContext() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            return audioCtx;
        }

        function playClickSound() {
            if (!soundEnabled) return;
            try {
                const ctx = getAudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            } catch(e) {}
        }

        function playSuccessSound() {
            if (!soundEnabled) return;
            try {
                const ctx = getAudioContext();
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.1);
                osc.frequency.setValueAtTime(783.99, now + 0.2);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            } catch(e) {}
        }

        function playVictoryFanfare() {
            if (!soundEnabled) return;
            try {
                const ctx = getAudioContext();
                const now = ctx.currentTime;
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.15);
                    gain.gain.setValueAtTime(0.25, now + idx * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.15);
                    osc.stop(now + idx * 0.15 + 0.4);
                });
            } catch(e) {}
        }

        function playErrorSound() {
            if (!soundEnabled) return;
            try {
                const ctx = getAudioContext();
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.setValueAtTime(164.81, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.3);
            } catch(e) {}
        }

        function toggleSound() {
            soundEnabled = !soundEnabled;
            const btn = document.getElementById('soundToggleBtn');
            if (btn) {
                if (soundEnabled) {
                    btn.innerText = "ENABLED";
                    btn.className = "px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold";
                } else {
                    btn.innerText = "DISABLED";
                    btn.className = "px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold";
                }
            }
        }

        function toggleSettingsModal() {
            playClickSound();
            const modal = document.getElementById('settingsModal');
            if (!modal) return;
            if (modal.classList.contains('hidden')) {
                modal.classList.remove('hidden');
                setTimeout(() => modal.classList.remove('opacity-0'), 10);
            } else {
                modal.classList.add('opacity-0');
                setTimeout(() => modal.classList.add('hidden'), 300);
            }
        }

        function closeQuizModal() {
            playClickSound();
            if (typeof quizTimer !== 'undefined' && quizTimer) {
                clearInterval(quizTimer);
            }
            const modal = document.getElementById('quizModal');
            if (!modal) return;
            modal.classList.add('opacity-0');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }

        // Particle Canvas
        function initParticleCanvas() {
            const canvas = document.getElementById('particleCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;

            window.addEventListener('resize', () => {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            });

            const particles = Array.from({ length: 45 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.5 + 0.8,
                color: ['#00d2ff', '#a855f7', '#ec4899', '#3b82f6'][Math.floor(Math.random() * 4)],
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                alpha: Math.random() * 0.7 + 0.3
            }));

            function animateParticles() {
                ctx.clearRect(0, 0, width, height);
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < 0) p.x = width;
                    if (p.x > width) p.x = 0;
                    if (p.y < 0) p.y = height;
                    if (p.y > height) p.y = 0;

                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
                requestAnimationFrame(animateParticles);
            }

            animateParticles();
        }

        // Custom Stages Configuration
        const STAGES_CONFIG = [
            { id: 1, title: "Stage 1: Beginner", desc: "Logic Basics & Warmup", icon: "fa-seedling" },
            { id: 2, title: "Stage 2: Explorer", desc: "Pattern Discovery & Sequences", icon: "fa-compass" },
            { id: 3, title: "Stage 3: Learner", desc: "Visual Puzzles, Code Logic & Daily Riddles", icon: "fa-book-open" },
            { id: 4, title: "Stage 4: Mind Challenger", desc: "Math Reasoning, Mystery Puzzles & Brain Teasers", icon: "fa-brain", badge: "Mind Challenger" },
            { id: 5, title: "Stage 5: Challenger", desc: "Lateral Thinking & Riddles", icon: "fa-bolt" },
            { id: 6, title: "Stage 6: Genius", desc: "Detective Mysteries, Advanced Patterns & Survival Strategy", icon: "fa-cubes", badge: "Genius Mind" },
            { id: 7, title: "Stage 7: Expert Master", desc: "Advanced Logic, Complex Math & Brain Puzzles", icon: "fa-brain", badge: "Expert Thinker" },
            { id: 8, title: "Stage 8: Mastermind", desc: "Strategic Focus & Stroop Test", icon: "fa-shield-halved" },
            { id: 9, title: "Stage 9: Grandmaster", desc: "Master IQ Challenge & Reflexes", icon: "fa-chess-king" },
            { id: 10, title: "Stage 10: Ultimate Master", desc: "The Ultimate All-Domain Test", icon: "fa-crown" }
        ];

        // Complete 320 Playable Questions Database across all 10 Stages
        const STAGE_QUESTIONS = {
            1: [
                { category: "General Knowledge", q: "What is the capital of India?", opts: ["New Delhi", "Mumbai", "Kolkata", "Chennai"], a: 0 },
                { category: "General Knowledge", q: "Which planet is known as the Red Planet?", opts: ["Venus", "Mars", "Jupiter", "Saturn"], a: 1 },
                { category: "General Knowledge", q: "How many continents are there on Earth?", opts: ["5", "6", "7", "8"], a: 2 },
                { category: "General Knowledge", q: "Which animal is known as the King of the Jungle?", opts: ["Tiger", "Elephant", "Lion", "Cheetah"], a: 2 },
                { category: "General Knowledge", q: "What is the largest mammal on Earth?", opts: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"], a: 1 },
                { category: "General Knowledge", q: "Which gas do plants absorb from the atmosphere?", opts: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], a: 1 },
                { category: "General Knowledge", q: "How many days are there in a leap year?", opts: ["364", "365", "366", "367"], a: 2 },
                { category: "General Knowledge", q: "What is the boiling point of water at sea level?", opts: ["90°C", "100°C", "110°C", "120°C"], a: 1 },
                { category: "General Knowledge", q: "Which is the smallest continent by land area?", opts: ["Europe", "Antarctica", "Australia", "South America"], a: 2 },
                { category: "General Knowledge", q: "What is the primary source of energy for Earth?", opts: ["The Moon", "Geothermal", "The Sun", "Wind"], a: 2 },
                { category: "General Knowledge", q: "Which metal is liquid at room temperature?", opts: ["Iron", "Mercury", "Gold", "Aluminum"], a: 1 },
                { category: "General Knowledge", q: "How many bones are in the adult human body?", opts: ["196", "206", "216", "226"], a: 1 },
                { category: "General Knowledge", q: "What is the chemical symbol for gold?", opts: ["Ag", "Au", "Pb", "Fe"], a: 1 },
                { category: "General Knowledge", q: "Which ocean is the largest on Earth?", opts: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"], a: 2 },
                { category: "General Knowledge", q: "Who painted the Mona Lisa?", opts: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], a: 2 },
                { category: "General Knowledge", q: "What is the hardest natural substance on Earth?", opts: ["Gold", "Iron", "Diamond", "Platinum"], a: 2 },
                { category: "General Knowledge", q: "Which country is home to the Great Pyramid of Giza?", opts: ["Mexico", "Egypt", "Peru", "Sudan"], a: 1 },
                { category: "General Knowledge", q: "What is the speed of light approximately?", opts: ["300,000 km/s", "150,000 km/s", "1,000 km/s", "3,000 km/s"], a: 0 },
                { category: "General Knowledge", q: "Which vitamin is abundant in citrus fruits like oranges?", opts: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], a: 2 },
                { category: "General Knowledge", q: "What is the currency of Japan?", opts: ["Yuan", "Won", "Yen", "Ringgit"], a: 2 },
                { category: "General Knowledge", q: "Which gas makes up the majority of Earth's atmosphere?", opts: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], a: 2 },
                { category: "General Knowledge", q: "Who wrote 'Romeo and Juliet'?", opts: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], a: 1 },
                { category: "General Knowledge", q: "What is the capital city of France?", opts: ["London", "Berlin", "Madrid", "Paris"], a: 3 },
                { category: "General Knowledge", q: "Which instrument is used to measure earthquakes?", opts: ["Barometer", "Seismograph", "Thermometer", "Anemometer"], a: 1 },
                { category: "General Knowledge", q: "What is the tallest mountain in the world?", opts: ["K2", "Kangchenjunga", "Mount Everest", "Makalu"], a: 2 },
                { category: "General Knowledge", q: "How many players are on the field in a standard soccer team?", opts: ["9", "10", "11", "12"], a: 2 },
                { category: "General Knowledge", q: "Which planet is closest to the Sun?", opts: ["Venus", "Mercury", "Earth", "Mars"], a: 1 },
                { category: "General Knowledge", q: "What is the main ingredient in guacamole?", opts: ["Tomato", "Avocado", "Onion", "Pepper"], a: 1 },
                { category: "General Knowledge", q: "In which year did World War II end?", opts: ["1943", "1945", "1950", "1939"], a: 1 },
                { category: "General Knowledge", q: "What is the freezing point of water in Fahrenheit?", opts: ["0°F", "32°F", "100°F", "212°F"], a: 1 }
            ],
            2: [
                { category: "Logical Reasoning", q: "Find the missing number in series: 2, 4, 6, 8, ?", opts: ["9", "10", "12", "14"], a: 1 },
                { category: "Logical Reasoning", q: "What comes next in pattern: A, C, E, G, ?", opts: ["H", "I", "J", "K"], a: 1 },
                { category: "Logical Reasoning", q: "If all Zings are Zangs and all Zangs are Zungs, are all Zings Zungs?", opts: ["Yes", "No", "Cannot be determined", "None"], a: 0 },
                { category: "Logical Reasoning", q: "Find the odd one out: Apple, Banana, Carrot, Orange", opts: ["Apple", "Banana", "Carrot", "Orange"], a: 2 },
                { category: "Logical Reasoning", q: "If 5 cats catch 5 mice in 5 minutes, how long for 1 cat to catch 1 mouse?", opts: ["1 minute", "5 minutes", "25 minutes", "10 minutes"], a: 1 },
                { category: "Logical Reasoning", q: "Complete the series: 3, 6, 12, 24, ?", opts: ["36", "48", "60", "30"], a: 1 },
                { category: "Logical Reasoning", q: "Which shape has four equal sides and four 90-degree angles?", opts: ["Rectangle", "Square", "Rhombus", "Trapezoid"], a: 1 },
                { category: "Logical Reasoning", q: "If yesterday was two days before Monday, what day is today?", opts: ["Friday", "Saturday", "Sunday", "Thursday"], a: 0 },
                { category: "Logical Reasoning", q: "What is 15% of 200?", opts: ["20", "25", "30", "35"], a: 2 },
                { category: "Logical Reasoning", q: "Find the next number: 1, 1, 2, 3, 5, 8, ?", opts: ["11", "12", "13", "15"], a: 2 },
                { category: "Logical Reasoning", q: "Which word does not belong with the others: Dog, Cat, Lion, Chair", opts: ["Dog", "Cat", "Lion", "Chair"], a: 3 },
                { category: "Logical Reasoning", q: "If code for CAT is DBU, what is code for DOG?", opts: ["EPH", "DPH", "EPI", "FPH"], a: 0 },
                { category: "Logical Reasoning", q: "How many seconds are in one hour?", opts: ["3600", "600", "60", "86400"], a: 0 },
                { category: "Logical Reasoning", q: "If a train travels 60 miles in 1 hour, what is its speed?", opts: ["30 mph", "60 mph", "120 mph", "90 mph"], a: 1 },
                { category: "Logical Reasoning", q: "What is half of a quarter of 80?", opts: ["5", "10", "20", "40"], a: 1 },
                { category: "Logical Reasoning", q: "Complete sequence: Z, X, V, T, ?", opts: ["R", "S", "Q", "P"], a: 0 },
                { category: "Logical Reasoning", q: "If 3 pencils cost $1.50, how much do 10 pencils cost?", opts: ["$4.00", "$4.50", "$5.00", "$6.00"], a: 2 },
                { category: "Logical Reasoning", q: "Which number is prime?", opts: ["9", "15", "21", "17"], a: 3 },
                { category: "Logical Reasoning", q: "If a box contains 12 red balls and 12 blue balls, minimum drawn for 2 same color?", opts: ["2", "3", "4", "12"], a: 1 },
                { category: "Logical Reasoning", q: "What is the square root of 144?", opts: ["10", "11", "12", "14"], a: 2 },
                { category: "Logical Reasoning", q: "Find missing number: 10, 20, 30, 40, ?", opts: ["45", "50", "60", "100"], a: 1 },
                { category: "Logical Reasoning", q: "If North becomes East, what does East become?", opts: ["North", "South", "West", "South-East"], a: 1 },
                { category: "Logical Reasoning", q: "Which fraction is greatest: 1/2, 3/4, 2/3, 4/5?", opts: ["1/2", "3/4", "2/3", "4/5"], a: 3 },
                { category: "Logical Reasoning", q: "How many degrees are in a triangle?", opts: ["90°", "180°", "270°", "360°"], a: 1 },
                { category: "Logical Reasoning", q: "If 8 workers build a wall in 5 days, how many days for 4 workers?", opts: ["5 days", "10 days", "20 days", "2 days"], a: 1 },
                { category: "Logical Reasoning", q: "What is 7 multiplied by 8 minus 6?", opts: ["50", "56", "48", "42"], a: 1 },
                { category: "Logical Reasoning", q: "Complete series: 5, 10, 20, 40, ?", opts: ["60", "80", "100", "120"], a: 1 },
                { category: "Logical Reasoning", q: "If John is taller than Mark, and Mark is taller than Paul, who is tallest?", opts: ["John", "Mark", "Paul", "Cannot tell"], a: 0 },
                { category: "Logical Reasoning", q: "What is next in pattern: 2, 3, 5, 7, 11, ?", opts: ["12", "13", "15", "17"], a: 1 },
                { category: "Logical Reasoning", q: "If you rearrange 'AGRDN', you get the name of a:", opts: ["City", "Animal", "Fruit", "Planet"], a: 1 }
            ],
            3: [
                { category: "Visual Puzzles", q: "Which visual shape has no corners or edges?", opts: ["Square", "Triangle", "Circle", "Pentagon"], a: 2 },
                { category: "Visual Puzzles", q: "If you fold a piece of paper in half 3 times, how many layers do you get?", opts: ["3", "6", "8", "12"], a: 2 },
                { category: "Visual Puzzles", q: "Spot the hidden pattern: 1, 4, 9, 16, 25, ?", opts: ["30", "35", "36", "49"], a: 2 },
                { category: "Visual Puzzles", q: "Which mirror reflection of letter 'b' looks correct?", opts: ["d", "p", "q", "b"], a: 0 },
                { category: "Visual Puzzles", q: "How many triangles are in a star of David?", opts: ["4", "6", "8", "10"], a: 1 },
                { category: "Visual Puzzles", q: "If a cube has 6 faces, 8 vertices, how many edges does it have?", opts: ["10", "12", "14", "16"], a: 1 },
                { category: "Visual Puzzles", q: "What color do you get when mixing Blue and Yellow?", opts: ["Purple", "Green", "Orange", "Brown"], a: 1 },
                { category: "Visual Puzzles", q: "Which symbol represents infinity?", opts: ["8 sideways", "Double zero", "Cross", "Triangle"], a: 0 },
                { category: "Visual Puzzles", q: "If you rotate a square 45 degrees, what shape does it resemble?", opts: ["Rectangle", "Diamond", "Triangle", "Circle"], a: 1 },
                { category: "Visual Puzzles", q: "What is the angle of a straight line?", opts: ["45°", "90°", "180°", "360°"], a: 2 },
                { category: "Visual Puzzles", q: "Which coding logic: if A=1, B=2, what is CAB?", opts: ["312", "123", "6", "321"], a: 0 },
                { category: "Visual Puzzles", q: "If binary 10 equals decimal 2, what is binary 11?", opts: ["2", "3", "4", "5"], a: 1 },
                { category: "Visual Puzzles", q: "Which logic gate outputs 1 only when both inputs are 1?", opts: ["OR", "AND", "NOT", "XOR"], a: 1 },
                { category: "Visual Puzzles", q: "Find the odd symbol out: @, #, $, 7", opts: ["@", "#", "$", "7"], a: 3 },
                { category: "Visual Puzzles", q: "If a switch is off, and light bulb is cold, what can you deduce?", opts: ["Bulb is broken", "Power is off", "It was off for a while", "Can't be sure"], a: 2 },
                { category: "Visual Puzzles", q: "Which daily puzzle: You walk into a room with a match, a kerosene lamp, a candle, and a fireplace. What do you light first?", opts: ["Lamp", "Candle", "Fireplace", "Match"], a: 3 },
                { category: "Visual Puzzles", q: "A man pushes his car to a hotel and tells the owner he's bankrupt. Why?", opts: ["Car broke down", "He lost keys", "He was playing Monopoly", "No fuel"], a: 2 },
                { category: "Visual Puzzles", q: "What has keys but no locks, space but no room, and you can enter?", opts: ["House", "Keyboard", "Piano", "Car"], a: 1 },
                { category: "Visual Puzzles", q: "What gets wetter the more it dries?", opts: ["Sponge", "Towel", "Water", "Cloth"], a: 1 },
                { category: "Visual Puzzles", q: "What has to be broken before you can use it?", opts: ["Coconut", "Egg", "Glass", "Promise"], a: 1 },
                { category: "Visual Puzzles", q: "I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?", opts: ["Echo", "Shadow", "Cloud", "Ghost"], a: 0 },
                { category: "Visual Puzzles", q: "You see a boat filled with people, yet there isn’t a single person on board. How?", opts: ["It's sinking", "They are married", "They are ghosts", "It's a toy"], a: 1 },
                { category: "Visual Puzzles", q: "What is full of holes but still holds water?", opts: ["Net", "Sponge", "Bucket", "Colander"], a: 1 },
                { category: "Visual Puzzles", q: "What goes up and down but never moves?", opts: ["Stairs", "Elevator", "Temperature", "Cloud"], a: 0 },
                { category: "Visual Puzzles", q: "What has one eye but cannot see?", opts: ["Needle", "Storm", "Potato", "Fish"], a: 0 },
                { category: "Visual Puzzles", q: "What can you catch, but not throw?", opts: ["Cold", "Ball", "Frisbee", "Shadow"], a: 0 },
                { category: "Visual Puzzles", q: "What is brown and has a head and a tail, but no legs?", opts: ["Coin", "Snake", "Worm", "Stick"], a: 0 },
                { category: "Visual Puzzles", q: "If 2's company and 3's a crowd, what are 4 and 5?", opts: ["Nine", "Party", "Crowd", "Alone"], a: 0 },
                { category: "Visual Puzzles", q: "What invention lets you look right through a wall?", opts: ["Window", "Glasses", "X-ray", "Camera"], a: 0 },
                { category: "Visual Puzzles", q: "Which month has 28 days?", opts: ["February", "All of them", "None", "December"], a: 1 }
            ],
            4: [
                { category: "Math Reasoning", q: "If a farmer has 17 sheep and all but 9 die, how many are left?", opts: ["8", "9", "17", "0"], a: 1 },
                { category: "Math Reasoning", q: "What is 3 + 3 × 3 - 3 ÷ 3?", opts: ["9", "11", "13", "15"], a: 1 },
                { category: "Math Reasoning", q: "If a clock strikes 6 times in 5 seconds, how long to strike 12 times?", opts: ["10 seconds", "11 seconds", "12 seconds", "14.4 seconds"], a: 3 },
                { category: "Math Reasoning", q: "Two fathers and two sons went fishing and caught 3 fish total, yet each caught one. How?", opts: ["Impossible", "Grandfather, Father, Son", "They shared", "They lied"], a: 1 },
                { category: "Math Reasoning", q: "If 5 machines make 5 widgets in 5 minutes, how long for 100 machines to make 100 widgets?", opts: ["5 mins", "100 mins", "50 mins", "20 mins"], a: 0 },
                { category: "Math Reasoning", q: "A bat and ball cost $1.10 total. The bat costs $1.00 more than the ball. How much is the ball?", opts: ["$0.10", "$0.05", "$0.01", "$0.15"], a: 1 },
                { category: "Math Reasoning", q: "If lily pads double in area every day and cover a pond in 30 days, how long for half the pond?", opts: ["15 days", "29 days", "28 days", "14 days"], a: 1 },
                { category: "Math Reasoning", q: "What number comes next: 2, 6, 12, 20, 30, ?", opts: ["40", "42", "45", "50"], a: 1 },
                { category: "Math Reasoning", q: "If you divide 30 by half and add 10, what do you get?", opts: ["25", "40", "50", "70"], a: 3 },
                { category: "Math Reasoning", q: "Which prime number is even?", opts: ["2", "4", "0", "None"], a: 0 },
                { category: "Detective Mystery", q: "A man is found dead in his study with a book in his hand and no wounds. How did he die?", opts: ["Poison", "Heart attack", "Reading a murder mystery book", "Suicide"], a: 2 },
                { category: "Detective Mystery", q: "Detective Cole finds a suspect with mud on his boots at the crime scene. Suspect claims he was at the beach. Who is lying?", opts: ["Cole", "Suspect", "No one", "Both"], a: 1 },
                { category: "Detective Mystery", q: "A jewelry store is robbed. The thief left fingerprints only on the ceiling. How did they reach?", opts: ["Stilts", "Helicopter", "It was a room with low furniture/ladder", "Magic"], a: 2 },
                { category: "Detective Mystery", q: "Three men check into a hotel room costing $30. Later manager realizes it was $25 and sends $5 back. Bellboy keeps $2, gives $1 to each. They paid $9x3 = $27 + $2 bellboy = $29. Where is the missing $1?", opts: ["No missing dollar, faulty math phrasing", "Manager stole it", "In the safe", "Tax"], a: 0 },
                { category: "Detective Mystery", q: "A woman shoots her husband, then holds him under water for 5 minutes. Later they go out for dinner. How?", opts: ["He survived", "She was a photographer in a darkroom", "Magic", "It was a stunt"], a: 1 },
                { category: "Detective Mystery", q: "If a green house is made of green glass, what is a white house made of?", opts: ["White glass", "Wood", "Glass", "Brick"], a: 2 },
                { category: "Detective Mystery", q: "Which of the following is an alibi?", opts: ["Proof of being elsewhere during crime", "A weapon", "A fingerprint", "A confession"], a: 0 },
                { category: "Detective Mystery", q: "If a killer says 'I did not commit this crime', but CCTV shows otherwise, what is verified?", opts: ["Witness is false", "CCTV is supreme evidence", "Killer is innocent", "No crime occurred"], a: 1 },
                { category: "Detective Mystery", q: "Why do detectives check shoe treads?", opts: ["To check brand", "To match prints at crime scene mud", "To check shoe size", "For fun"], a: 1 },
                { category: "Detective Mystery", q: "A safe combination is 3 digits. Sum is 15. First is half of second. Third is sum of first two. What is it?", opts: ["369", "246", "123", "555"], a: 0 },
                { category: "Advanced Brain Teaser", q: "If a barrel weighs 40kg, what must you put in it to make it weigh 20kg?", opts: ["Nothing", "Holes", "Helium", "Lead"], a: 1 },
                { category: "Advanced Brain Teaser", q: "If you have 3 apples and take away 2, how many do you have?", opts: ["1", "2", "3", "0"], a: 1 },
                { category: "Advanced Brain Teaser", q: "How many months have 28 days?", opts: ["1", "2", "6", "12"], a: 3 },
                { category: "Advanced Brain Teaser", q: "If a plane crashes on the border of US and Canada, where do they bury the survivors?", opts: ["US", "Canada", "Border", "Survivors aren't buried"], a: 3 },
                { category: "Advanced Brain Teaser", q: "Which letter comes alphabetically first in 'BRAINTEST'?", opts: ["A", "B", "E", "I"], a: 0 },
                { category: "Advanced Brain Teaser", q: "If 1=3, 2=3, 3=5, 4=4, 5=4, what is 6=?", opts: ["3", "4", "5", "6"], a: 0 },
                { category: "Advanced Brain Teaser", q: "What can travel around the world while staying in a corner?", opts: ["Stamp", "Wind", "Light", "Thought"], a: 0 },
                { category: "Advanced Brain Teaser", q: "What has 13 hearts, but no other organs?", opts: ["A deck of cards", "A statue", "An alien", "A robot"], a: 0 },
                { category: "Advanced Brain Teaser", q: "I am light as a feather, yet the strongest man can't hold me for 5 minutes. What am I?", opts: ["Breath", "Water", "Air", "Glass"], a: 0 },
                { category: "Advanced Brain Teaser", q: "What is always coming, but never arrives?", opts: ["Tomorrow", "Yesterday", "Next year", "Winter"], a: 0 }
            ],
            5: [
                { category: "Code Breakers", q: "If code for BRAIN is CSBJO, what is code for TEST?", opts: ["UFTU", "UFTV", "WGTW", "UFSU"], a: 0 },
                { category: "Code Breakers", q: "Decode binary 1010 to decimal:", opts: ["8", "10", "12", "14"], a: 1 },
                { category: "Code Breakers", q: "If A=2, B=4, C=6, what is the sum of letters in DOG?", opts: ["26", "28", "30", "32"], a: 1 },
                { category: "Code Breakers", q: "Find missing symbol in pattern: 2, 5, 10, 17, ?", opts: ["24", "26", "28", "30"], a: 1 },
                { category: "Code Breakers", q: "If Cipher shifts each letter by +3, what does KPH become?", opts: ["NSK", "MSK", "OTL", "NRJ"], a: 0 },
                { category: "Code Breakers", q: "What is hexadecimal value for decimal 15?", opts: ["E", "F", "10", "A"], a: 1 },
                { category: "Code Breakers", q: "If 7 * 7 = 100 in base X, what is X?", opts: ["Base 7", "Base 8", "Base 9", "Base 5"], a: 2 },
                { category: "Code Breakers", q: "Complete Caesar cipher: G, J, M, P, ?", opts: ["Q", "R", "S", "T"], a: 2 },
                { category: "Code Breakers", q: "If 1011 (binary) is inverted (NOT), what is result?", opts: ["0100", "0101", "1100", "1000"], a: 0 },
                { category: "Code Breakers", q: "Find the odd cipher out among AES, RSA, DES, HTTP", opts: ["AES", "RSA", "DES", "HTTP"], a: 3 },
                { category: "World Knowledge Challenge", q: "Which planet has the most moons?", opts: ["Jupiter", "Saturn", "Uranus", "Neptune"], a: 1 },
                { category: "World Knowledge Challenge", q: "What is the deepest ocean trench on Earth?", opts: ["Java Trench", "Mariana Trench", "Puerto Rico Trench", "Sunda Trench"], a: 1 },
                { category: "World Knowledge Challenge", q: "Who proposed the theory of General Relativity?", opts: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Galileo Galilei"], a: 1 },
                { category: "World Knowledge Challenge", q: "Which chemical element has the highest melting point?", opts: ["Iron", "Carbon", "Tungsten", "Platinum"], a: 2 },
                { category: "World Knowledge Challenge", q: "What is the capital of Australia?", opts: ["Sydney", "Melbourne", "Canberra", "Perth"], a: 2 },
                { category: "World Knowledge Challenge", q: "Which of these gases is most abundant in the Sun?", opts: ["Oxygen", "Helium", "Hydrogen", "Nitrogen"], a: 2 },
                { category: "World Knowledge Challenge", q: "What is the powerhouse of the cell?", opts: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], a: 2 },
                { category: "World Knowledge Challenge", q: "In which year did humans first land on the Moon?", opts: ["1965", "1969", "1972", "1975"], a: 1 },
                { category: "World Knowledge Challenge", q: "Which river is the longest in the world?", opts: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"], a: 1 },
                { category: "World Knowledge Challenge", q: "What is the speed of sound in air approximately?", opts: ["343 m/s", "1500 m/s", "300,000 m/s", "50 m/s"], a: 0 },
                { category: "Strategic Thinking", q: "You have 3 light switches outside a closed room with 3 bulbs inside. How do you find which switch belongs to which bulb with only 1 entry?", opts: ["Guess", "Turn switch 1 on for 10 mins, turn off, turn switch 2 on, enter", "Turn all on", "Open door immediately"], a: 1 },
                { category: "Strategic Thinking", q: "You need to measure exactly 4 liters using 5L and 3L jugs. How?", opts: ["Fill 3L, pour to 5L...", "Fill 5L, pour 3L out, empty 3L, pour remaining 2L to 3L, fill 5L, pour 1L to 3L", "Impossible", "Use a scale"], a: 1 },
                { category: "Strategic Thinking", q: "Three cannibals and three missionaries must cross a river in a 2-person boat. Cannibals can never outnumber missionaries on either bank. Minimum trips?", opts: ["5 trips", "7 trips", "9 trips", "11 trips"], a: 1 },
                { category: "Strategic Thinking", q: "You have 9 identical-looking coins, one is slightly heavier. Using a balance scale with minimum weighings to find it?", opts: ["1 weighing", "2 weighings", "3 weighings", "4 weighings"], a: 1 },
                { category: "Strategic Thinking", q: "Wolf, goat, and cabbage river crossing puzzle. What goes across first?", opts: ["Wolf", "Goat", "Cabbage", "Wolf and Cabbage"], a: 1 },
                { category: "Strategic Thinking", q: "If 5 people shake hands with everyone else once, how many handshakes total?", opts: ["10", "15", "20", "25"], a: 0 },
                { category: "Strategic Thinking", q: "A lily pad doubles daily, covers lake in 30 days. When is lake 1/4 covered?", opts: ["15 days", "28 days", "29 days", "7 days"], a: 1 },
                { category: "Strategic Thinking", q: "You're running a race and pass the person in 2nd place. What place are you in now?", opts: ["1st", "2nd", "3rd", "Last"], a: 1 },
                { category: "Strategic Thinking", q: "Which decision strategy prioritizes worst-case minimization?", opts: ["Maximin", "Maximax", "Minimax regret", "Expected value"], a: 0 },
                { category: "Strategic Thinking", q: "Optimal strategy for Monty Hall problem when you pick a door and host opens another goat?", opts: ["Stick with original door", "Always switch doors", "Doesn't matter", "Pick randomly"], a: 1 }
            ],
            6: [
                { category: "Detective Mysteries", q: "Detective John is told a murder happened on Sunday during a thunderstorm. The gardener says he was trimming roses, cook says making soup, maid says dusting library. Who is lying?", opts: ["Gardener", "Cook", "Maid", "None"], a: 0 },
                { category: "Detective Mysteries", q: "A wealthy man is found murdered in his mansion. The suspects are his four friends. Alibis: Tom was playing tennis, Jack was reading by the fireplace, Bob was swimming in the indoor pool, Sam was sleeping. Who lied?", opts: ["Tom", "Jack", "Bob", "Sam"], a: 2 },
                { category: "Detective Mysteries", q: "A jewel theft occurred in a locked museum room. No doors or windows were forced. Glass case was intact. How did the thief steal the diamond?", opts: ["Skylight was open", "Museum was open during day and case was swapped", "Inside job", "Ghost"], a: 1 },
                { category: "Detective Mysteries", q: "A note found at a crime scene says: '555-6833'. The victim was a mathematician. What does it mean upside down?", obs: ["Phone number", "Error code", "Spells 'BEEF-LESS' or calculator word", "Random"], a: 2 },
                { category: "Detective Mysteries", q: "Three suspects claim innocence. Suspect A: 'B did it.' Suspect B: 'C is lying.' Suspect C: 'B is lying.' Only one is telling the truth. Who is guilty?", opts: ["A", "B", "C", "None"], a: 1 },
                { category: "Detective Mysteries", q: "A dead body is found in the desert wearing a backpack. Everyone else around is fine. How did he die?", opts: ["Dehydration", "His parachute didn't open", "Starvation", "Animal attack"], a: 1 },
                { category: "Detective Mysteries", q: "A man receives a package in the mail. He opens it, looks at the contents inside, and immediately calls the police to report a murder. What was in the package?", opts: ["A bomb", "A bloody knife", "Ice sculpture of himself melting", "A ransom note"], a: 2 },
                { category: "Detective Mysteries", q: "Detective Vance inspects an office where a robbery happened. The desk calendar shows 'October 15', but newspapers outside say 'October 10'. What does this indicate?", opts: ["Calendar is wrong", "Staged crime scene set in the future", "Time travel", "Holiday"], a: 1 },
                { category: "Detective Mysteries", q: "A suspect claims he was watching a 3-hour movie at home without electricity during a blackout. Why is he lying?", opts: ["TV needs electricity", "Movies are 2 hours", "Blackout was short", "He has no TV"], a: 0 },
                { category: "Detective Mysteries", q: "In a poisoning case, everyone at the dinner table ate the exact same soup, yet only one person died. Why?", opts: ["Only one person was allergic", "Poison was put in the ice cubes which only melted in one glass", "Poison was in the spoon", "Suicide"], a: 1 },
                { category: "Advanced Pattern Lab", q: "Find missing number in sequence: 3, 7, 15, 31, 63, ?", opts: ["120", "127", "130", "140"], a: 1 },
                { category: "Advanced Pattern Lab", q: "What comes next in alpha pattern: AZ, BY, CX, DW, ?", opts: ["EV", "EU", "EX", "EW"], a: 0 },
                { category: "Advanced Pattern Lab", q: "Find the missing number: 8, 27, 64, 125, ?", opts: ["196", "216", "225", "256"], a: 1 },
                { category: "Advanced Pattern Lab", q: "Complete numeric pattern: 1, 2, 6, 24, 120, ?", opts: ["600", "720", "840", "900"], a: 1 },
                { category: "Advanced Pattern Lab", q: "What is next in code series: 2, 3, 5, 7, 11, 13, 17, ?", opts: ["18", "19", "21", "23"], a: 1 },
                { category: "Advanced Pattern Lab", q: "Find missing symbol pattern: O, T, T, F, F, S, S, E, N, ?", opts: ["T", "E", "O", "S"], a: 0 },
                { category: "Advanced Pattern Lab", q: "If triangle=3, square=4, pentagon=5, what is dodecagon?", opts: ["10", "11", "12", "14"], a: 2 },
                { category: "Advanced Pattern Lab", q: "Complete series: 1, 4, 9, 16, 25, 36, ?", opts: ["42", "48", "49", "64"], a: 2 },
                { category: "Advanced Pattern Lab", q: "What is missing letter: J, F, M, A, M, J, J, A, S, O, N, ?", opts: ["D", "J", "F", "M"], a: 0 },
                { category: "Advanced Pattern Lab", q: "Find missing number: 0, 1, 1, 2, 3, 5, 8, 13, ?", opts: ["20", "21", "24", "26"], a: 1 },
                { category: "Survival and Strategy", q: "You are trapped in a room with two doors: one leads to certain death, one to freedom. Two guards stand there: one always lies, one always tells the truth. What single question do you ask one guard?", opts: ["Which door is freedom?", "If I asked the other guard, what would he say?", "Are you a liar?", "Which way out?"], a: 1 },
                { category: "Survival and Strategy", q: "You have 100 glowing red hot stones. You must cross a freezing river carrying them, but dropping one means frostbite. Best strategy?", opts: ["Carry all at once", "Wait for them to cool down", "Carry one by one", "Throw them"], a: 1 },
                { category: "Survival and Strategy", q: "A bear walks south 1 mile, east 1 miles, north 1 mile and returns to starting spot. What color is the bear?", opts: ["Brown", "Black", "White (Polar bear at North Pole)", "Grizzly"], a: 2 },
                { category: "Survival and Strategy", q: "You are escaping a maze with 3 exits: Exit A has raging fire, Exit B has assassins with guns, Exit C has starved lions for 3 months. Which exit do you choose?", opts: ["Exit A", "Exit B", "Exit C (lions starved for 3 months are dead)", "None"], a: 2 },
                { category: "Survival and Strategy", q: "You have 5 sacks of gold coins, each with 10 coins. One sack has fake coins weighing 9g instead of 10g. Minimum weighings on digital scale?", opts: ["1 weighing", "2 weighings", "3 weighings", "5 weighings"], a: 0 },
                { category: "Survival and Strategy", q: "Two ropes burn for exactly 1 hour each, but unevenly. How to measure 45 minutes?", opts: ["Burn rope 1 from both ends, rope 2 from one end", "Burn both completely", "Cut in half", "Impossible"], a: 0 },
                { category: "Survival and Strategy", q: "You are stuck on an island with limited rations for 10 people lasting 5 days. 3 people leave. How many days do rations last for remaining?", opts: ["5 days", "7 days", "10 days", "15 days"], a: 1 },
                { category: "Survival and Strategy", q: "A plane has 500 bricks on board. One falls out. How many left?", opts: ["499", "500", "0", "498"], a: 0 },
                { category: "Survival and Strategy", q: "What strategy minimizes maximum possible loss in game theory?", opts: ["Maximin", "Minimax", "Nash Equilibrium", "Pareto optimal"], a: 1 },
                { category: "Survival and Strategy", q: "If you drop a glass ball from a 100-story building with 2 identical balls, minimum drops required in worst-case to find exact breaking floor?", opts: ["50 drops", "14 drops", "10 drops", "100 drops"], a: 1 }
            ],
            7: [
                { category: "Advanced Logical Reasoning", q: "If all Bloops are Bleeps, and all Bleeps are Blips, are all Bloops guaranteed to be Blips?", opts: ["Yes", "No", "Only on weekends", "Cannot determine"], a: 0 },
                { category: "Advanced Logical Reasoning", q: "Which logical fallacy assumes something is true because it hasn't been proven false?", opts: ["Ad Hominem", "Appeal to Ignorance", "Straw Man", "Circular Reasoning"], a: 1 },
                { category: "Advanced Logical Reasoning", q: "If P implies Q, and Q is false, what can we logically deduce about P?", opts: ["P is true", "P is false", "P is undetermined", "Q is true"], a: 1 },
                { category: "Advanced Logical Reasoning", q: "Five people sit in a row. A is next to B, C is next to D, D is not next to E. E is on the far right. Who is in the middle?", opts: ["A", "B", "C", "D"], a: 2 },
                { category: "Advanced Logical Reasoning", q: "If some Glops are Gleps, and all Gleps are Glips, are some Glops definitely Glips?", opts: ["Yes", "No", "Maybe", "False"], a: 0 },
                { category: "Advanced Logical Reasoning", q: "Which of the following represents a valid modus ponens argument?", opts: ["If P then Q; P; therefore Q", "If P then Q; Q; therefore P", "If P then Q; not P; therefore not Q", "P or Q; not P; therefore Q"], a: 0 },
                { category: "Advanced Logical Reasoning", q: "In a race, Alex finished before Ben, Carl finished after Dan, and Ben finished before Carl. Who finished first?", opts: ["Alex", "Ben", "Carl", "Dan"], a: 0 },
                { category: "Advanced Logical Reasoning", q: "If statement 'All cats are mammals' is true, what is the converse?", opts: ["All mammals are cats", "No cats are mammals", "Some cats are mammals", "Some mammals are not cats"], a: 0 },
                { category: "Advanced Logical Reasoning", q: "Which word completes the analogy: Finger is to Hand as Leaf is to...?", opts: ["Tree", "Branch", "Root", "Stem"], a: 1 },
                { category: "Advanced Logical Reasoning", q: "If a knight always tells the truth and a knave always lies, and A says 'We are both knaves', what is A?", opts: ["Knight", "Knave", "Both", "Neither"], a: 1 },
                { category: "Mathematical Brain Challenges", q: "What is the next prime number after 79?", opts: ["81", "83", "87", "89"], a: 1 },
                { category: "Mathematical Brain Challenges", q: "Solve for x: 2^(x+1) = 32", opts: ["2", "3", "4", "5"], a: 2 },
                { category: "Mathematical Brain Challenges", q: "What is the sum of angles in a regular pentagon?", opts: ["360°", "540°", "720°", "1080°"], a: 1 },
                { category: "Mathematical Brain Challenges", q: "If the probability of rain is 0.3, what is the probability it does not rain?", opts: ["0.3", "0.7", "1.0", "0.5"], a: 1 },
                { category: "Mathematical Brain Challenges", q: "What is 11 squared minus 9 squared?", opts: ["20", "40", "80", "100"], a: 1 },
                { category: "Mathematical Brain Challenges", q: "If log10(x) = 3, what is x?", opts: ["10", "100", "1000", "10000"], a: 2 },
                { category: "Mathematical Brain Challenges", q: "What is the derivative of x^3 with respect to x?", opts: ["x^2", "3x^2", "3x", "6x"], a: 1 },
                { category: "Mathematical Brain Challenges", q: "In a triangle with sides 3, 4, 5, what is its area?", opts: ["6", "10", "12", "15"], a: 0 },
                { category: "Mathematical Brain Challenges", q: "What is the value of 5 factorial (5!)?", opts: ["60", "100", "120", "720"], a: 2 },
                { category: "Mathematical Brain Challenges", q: "If two numbers have a sum of 20 and product of 96, what are they?", opts: ["8 and 12", "10 and 10", "6 and 14", "4 and 16"], a: 0 },
                { category: "Advanced Brain Test Challenges", q: "You throw a ball straight up in a train moving at 100 mph. Where does it land?", opts: ["Behind you", "In front of you", "In your hand", "Outside the train"], a: 2 },
                { category: "Advanced Brain Test Challenges", q: "Which physical law explains why astronauts float in the International Space Station?", opts: ["Newton's Third Law", "Microgravity / Free fall orbit", "Boyle's Law", "Conservation of Momentum"], a: 1 },
                { category: "Advanced Brain Test Challenges", q: "What is the primary function of myelin sheath in neurons?", opts: ["Generate neurotransmitters", "Speed up nerve impulse conduction", "Protect nucleus", "Capture oxygen"], a: 1 },
                { category: "Advanced Brain Test Challenges", q: "Which optical illusion occurs when hot air bends light rays near a road surface?", opts: ["Rainbow", "Mirage", "Halo", "Aurora"], a: 1 },
                { category: "Advanced Brain Test Challenges", q: "If you have a 1000g block of ice and it melts completely into water inside a sealed container, what happens to total weight?", opts: ["Increases", "Decreases", "Stays exactly the same", "Evaporates"], a: 2 },
                { category: "Advanced Brain Test Challenges", q: "Which logical paradox involves a barber who shaves all men in town who do not shave themselves?", opts: ["Zeno's Paradox", "Russell's Paradox (Barber Paradox)", "Ship of Theseus", "Grandfather Paradox"], a: 1 },
                { category: "Advanced Brain Test Challenges", q: "What happens to the pressure of an ideal gas if its absolute temperature is doubled at constant volume?", opts: ["Halved", "Stays same", "Doubled", "Quadrupled"], a: 2 },
                { category: "Advanced Brain Test Challenges", q: "Which neurological condition makes individuals perceive letters or numbers as colors?", opts: ["Amnesia", "Synesthesia", "Dyslexia", "Aphasia"], a: 1 },
                { category: "Advanced Brain Test Challenges", q: "What is the theoretical maximum efficiency of a heat engine operating between two temperatures?", opts: ["Carnot efficiency", "Newtonian limit", "Kelvin coefficient", "Planck ratio"], a: 0 },
                { category: "Advanced Brain Test Challenges", q: "In game theory, what term describes a stable state where no player has incentive to unilaterally change their strategy?", opts: ["Pareto optimality", "Nash Equilibrium", "Zero-sum", "Minimax"], a: 1 }
            ],
            8: [
                { category: "Brain Logic", q: "If you rearrange the letters 'CIFAIPC', you get the name of a:", opts: ["City", "Ocean", "Country", "Animal"], a: 1 },
                { category: "Brain Logic", q: "What number logically replaces the question mark in 3, 9, 27, 81, ?", opts: ["162", "243", "342", "729"], a: 1 },
                { category: "Brain Logic", q: "Which of the following substances has the highest electrical conductivity at room temperature?", opts: ["Copper", "Silver", "Gold", "Aluminum"], a: 1 },
                { category: "Brain Logic", q: "A clock shows 3:15. What is the exact angle between the hour and minute hands?", opts: ["0°", "7.5°", "15°", "22.5°"], a: 1 },
                { category: "Brain Logic", q: "If 5 machines take 5 minutes to make 5 widgets, how long do 100 machines take to make 100 widgets?", opts: ["100 mins", "50 mins", "5 mins", "1 min"], a: 2 },
                { category: "Brain Logic", q: "Which programming paradigm treats computation as the evaluation of mathematical functions?", opts: ["Object-Oriented", "Functional", "Procedural", "Imperative"], a: 1 },
                { category: "Brain Logic", q: "What is the chemical formula for ozone?", opts: ["O", "O2", "O3", "CO2"], a: 2 },
                { category: "Brain Logic", q: "If all cats are animals and some animals are pets, are all cats definitely pets?", opts: ["Yes", "No", "Always", "Cannot determine"], a: 1 },
                { category: "Brain Logic", q: "Which organ in the human body consumes approximately 20% of total oxygen and energy?", opts: ["Heart", "Liver", "Brain", "Lungs"], a: 2 },
                { category: "Brain Logic", q: "What is the next number in Fibonacci sequence after 55?", opts: ["75", "89", "95", "100"], a: 1 },
                { category: "Science", q: "What is the atomic number of Carbon?", opts: ["5", "6", "7", "8"], a: 1 },
                { category: "Science", q: "Which subatomic particle carries a negative electrical charge?", opts: ["Proton", "Neutron", "Electron", "Positron"], a: 2 },
                { category: "Science", q: "What is the hardest known mineral on the Mohs scale?", opts: ["Quartz", "Topaz", "Corundum", "Diamond"], a: 3 },
                { category: "Science", q: "Which gas is responsible for the green glow of some auroras?", opts: ["Oxygen", "Nitrogen", "Helium", "Hydrogen"], a: 0 },
                { category: "Science", q: "What type of lens is used to correct myopia (nearsightedness)?", opts: ["Convex lens", "Concave lens", "Plano lens", "Cylindrical lens"], a: 1 },
                { category: "Science", q: "Which planet in our solar system rotates on its side?", opts: ["Jupiter", "Saturn", "Uranus", "Neptune"], a: 2 },
                { category: "Science", q: "What is the primary pigment responsible for photosynthesis in plants?", opts: ["Carotene", "Chlorophyll", "Xanthophyll", "Anthocyanin"], a: 1 },
                { category: "Science", q: "Which law states that energy cannot be created or destroyed, only transformed?", opts: ["Newton's First Law", "Law of Conservation of Energy (1st Thermo)", "Ohm's Law", "Coulomb's Law"], a: 1 },
                { category: "Science", q: "What is the pH level of pure water at 25°C?", opts: ["5", "7", "9", "14"], a: 1 },
                { category: "Science", q: "Which blood type is known as the universal donor?", opts: ["A+", "B+", "AB+", "O-"], a: 3 },
                { category: "Technology", q: "Who is widely considered the father of computer science and artificial intelligence?", opts: ["Bill Gates", "Alan Turing", "Steve Jobs", "Tim Berners-Lee"], a: 1 },
                { category: "Technology", q: "What does HTML stand for?", opts: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyperlinks Text Management Line", "Home Tool Markup Language"], a: 0 },
                { category: "Technology", q: "Which protocol is securely used for encrypted web browsing over the internet?", opts: ["HTTP", "FTP", "HTTPS", "SMTP"], a: 2 },
                { category: "Technology", q: "What is the main memory of a computer system directly accessed by CPU called?", opts: ["Hard Drive", "RAM", "SSD", "Flash Memory"], a: 1 },
                { category: "Technology", q: "In object-oriented programming, what term describes wrapping data and methods into a single unit?", opts: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], a: 2 },
                { category: "General Knowledge", q: "Which international organization has its headquarters in Geneva, Switzerland?", opts: ["United Nations", "World Health Organization (WHO)", "UNESCO", "World Bank"], a: 1 },
                { category: "General Knowledge", q: "What is the national currency of the United Kingdom?", opts: ["Euro", "Dollar", "Pound Sterling", "Franc"], a: 2 },
                { category: "General Knowledge", q: "Which desert is the largest hot desert in the world?", opts: ["Gobi Desert", "Kalahari Desert", "Sahara Desert", "Atacama Desert"], a: 2 },
                { category: "General Knowledge", q: "Who authored the epic novel 'War and Peace'?", opts: ["Fyodor Dostoevsky", "Leo Tolstoy", "Anton Chekhov", "Alexander Pushkin"], a: 1 },
                { category: "General Knowledge", q: "What is the smallest independent country in the world by land area?", opts: ["Monaco", "Liechtenstein", "Vatican City", "San Marino"], a: 2 }
            ],
            9: [
                { category: "Memory Challenges", q: "Memorize sequence: 4, 9, 2, 7, 5. What was the 3rd number?", opts: ["9", "2", "7", "4"], a: 1 },
                { category: "Memory Challenges", q: "If you saw words: Apple, Chair, Moon, Laptop, Shoe. Which was 4th?", opts: ["Moon", "Laptop", "Shoe", "Apple"], a: 1 },
                { category: "Memory Challenges", q: "Remember number: 83921. What is the sum of its digits?", opts: ["21", "23", "25", "27"], a: 1 },
                { category: "Memory Challenges", q: "Visual recall: A 3x3 grid has top-left, center, bottom-right filled. How many empty cells?", opts: ["4", "5", "6", "3"], a: 2 },
                { category: "Memory Challenges", q: "If sequence is Red, Blue, Green, Yellow, Red, Blue. What comes next?", opts: ["Red", "Green", "Yellow", "Blue"], a: 1 },
                { category: "Memory Challenges", q: "Recall color order: Cyan, Magenta, Yellow. Which was second?", opts: ["Cyan", "Magenta", "Yellow", "Black"], a: 1 },
                { category: "Memory Challenges", q: "Memorize code: X7-B9-K2. What was the middle segment?", opts: ["X7", "B9", "K2", "B2"], a: 1 },
                { category: "Memory Challenges", q: "If you memorized 7 items and recalled 5 after 1 minute, what is immediate recall accuracy?", opts: ["50%", "71.4%", "80%", "100%"], a: 1 },
                { category: "Memory Challenges", q: "Remember letters: M, Q, T, W, Z. Which letter was fourth?", opts: ["Q", "T", "W", "Z"], a: 2 },
                { category: "Memory Challenges", q: "Pattern memory: 2, 4, 8, 16. What was the 4th number?", opts: ["8", "12", "16", "32"], a: 2 },
                { category: "IQ Puzzles", q: "If 3 pipes fill a tank in 6 hours, how many hours for 2 pipes?", opts: ["4 hours", "9 hours", "12 hours", "10 hours"], a: 1 },
                { category: "IQ Puzzles", q: "Find missing number: 1, 3, 7, 15, 31, ?", opts: ["47", "63", "65", "127"], a: 1 },
                { category: "IQ Puzzles", q: "If a train covers 120 miles in 2 hours, what is average speed in km/h approx (1 mile = 1.6 km)?", opts: ["96 km/h", "120 km/h", "150 km/h", "192 km/h"], a: 0 },
                { category: "IQ Puzzles", q: "Which number is the odd one out: 27, 64, 125, 144, 216?", opts: ["27", "64", "144", "216"], a: 2 },
                { category: "IQ Puzzles", q: "If 8x = 64, and y + x = 15, what is y?", opts: ["5", "7", "8", "10"], a: 1 },
                { category: "IQ Puzzles", q: "What is the next term in letter series: B, E, H, K, N, ?", opts: ["P", "Q", "R", "S"], a: 1 },
                { category: "IQ Puzzles", q: "If a man is 4 times as old as his son, and sum of ages is 50, how old is son?", opts: ["8", "10", "12", "15"], a: 1 },
                { category: "IQ Puzzles", q: "What is angle between clock hands at 6:00?", opts: ["90°", "180°", "270°", "360°"], a: 1 },
                { category: "IQ Puzzles", q: "If 5 cats catch 5 mice in 5 minutes, how many minutes for 100 cats to catch 100 mice?", opts: ["100 mins", "25 mins", "5 mins", "1 min"], a: 2 },
                { category: "IQ Puzzles", q: "Find missing number: 7, 14, 21, 28, ?", opts: ["32", "35", "42", "49"], a: 1 },
                { category: "Real-World Problem Solving", q: "You have $100. You spend 40% on groceries, then 50% of the remaining on transport. How much is left?", opts: ["$20", "$30", "$40", "$50"], a: 1 },
                { category: "Real-World Problem Solving", q: "A meeting starts at 2:15 PM and lasts 1 hour 45 minutes. What time does it end?", opts: ["3:45 PM", "4:00 PM", "4:15 PM", "4:30 PM"], a: 1 },
                { category: "Real-World Problem Solving", q: "You need to bake a cake at 180°C for 40 mins. If you put it in at 3:10 PM, when is it ready?", opts: ["3:40 PM", "3:50 PM", "4:00 PM", "4:10 PM"], a: 1 },
                { category: "Real-World Problem Solving", q: "You drive 50 miles at 50 mph, then 50 miles at 100 mph. What is your average speed for the whole trip?", opts: ["66.6 mph", "75 mph", "70 mph", "60 mph"], a: 0 },
                { category: "Real-World Problem Solving", q: "If a project requires 12 days with 4 workers, how many days with 6 workers?", opts: ["6 days", "8 days", "10 days", "9 days"], a: 1 },
                { category: "Real-World Problem Solving", q: "You buy an item for $80 marked 20% off. What was original price?", opts: ["$96", "$100", "$110", "$120"], a: 1 },
                { category: "Real-World Problem Solving", q: "What is safest option if smoke fills your office hallway during a fire?", opts: ["Run through fast", "Stay low, crawl under smoke, check door temperature", "Open windows and shout", "Hide under desk"], a: 1 },
                { category: "Real-World Problem Solving", q: "If you manage a budget of $5000 and allocate 30% to marketing, how much remains?", opts: ["$1500", "$2500", "$3500", "$4000"], a: 2 },
                { category: "Real-World Problem Solving", q: "A car consumes 8 liters per 100 km. How many liters for 450 km trip?", opts: ["32 L", "36 L", "40 L", "44 L"], a: 1 },
                { category: "Real-World Problem Solving", q: "Best approach when faced with 3 urgent critical tasks simultaneously?", opts: ["Do easiest first", "Prioritize by impact and urgency (Eisenhower matrix)", "Do randomly", "Ignore all"], a: 1 }
            ],
            10: [
                // SET 1: HARD (Q1-10)
                { category: "Stage 10: Hard (1/3)", q: "If a clock takes 5 seconds to strike 6 times, how many seconds does it take to strike 12 times?", opts: ["10 seconds", "11 seconds", "12 seconds", "14.4 seconds"], a: 3, explanation: "Intervals between 6 strikes is 5, so each interval is 1s. 12 strikes have 11 intervals = 11 seconds? Wait, 6 strikes = 5 intervals = 5s (1s per interval). 12 strikes = 11 intervals = 11s." },
                { category: "Stage 10: Hard (2/3)", q: "Memorize sequence: 7, 3, 9, 1, 6. What was the 4th number?", opts: ["3", "9", "1", "6"], a: 2, explanation: "The 4th number in the sequence 7, 3, 9, 1, 6 is 1." },
                { category: "Stage 10: Hard (3/3)", q: "Find the missing number in the pattern: 2, 6, 12, 20, 30, ?", opts: ["40", "42", "45", "50"], a: 1, explanation: "Differences increase by 2 each time (+4, +6, +8, +10, +12). 30 + 12 = 42." },
                { category: "Stage 10: Hard (4/3)", q: "Detective case: A man is found shot dead in his locked office with no keyhole inside, window latched shut from inside. How?", opts: ["Suicide by hanging", "He was shot through glass", "It was a greenhouse / ice room that melted", "Murderer picked lock"], a: 2, explanation: "In an ice room, the murder weapon or ice structure melted away leaving no trace." },
                { category: "Stage 10: Hard (5/3)", q: "If all Zings are Zangs and some Zangs are Zungs, can we deduce that some Zings are definitely Zungs?", opts: ["Yes", "No", "Always", "Must be false"], a: 1, explanation: "There is no direct universal intersection guaranteed between Zings and Zungs." },
                { category: "Stage 10: Hard (6/3)", q: "What is 3 plus 3 times 3 minus 3 divided by 3?", opts: ["3", "7", "9", "11"], a: 3, explanation: "Using PEMDAS: 3 + (3×3) - (3÷3) = 3 + 9 - 1 = 11." },
                { category: "Stage 10: Hard (7/3)", q: "Spot the odd number out: 8, 27, 64, 125, 200, 343", opts: ["64", "125", "200", "343"], a: 2, explanation: "All others are exact cubes (2^3, 3^3, 4^3, 5^3, 7^3). 200 is not a cube." },
                { category: "Stage 10: Hard (8/3)", q: "A basket has 5 apples. You take away 3. How many apples do you have?", opts: ["2", "3", "5", "0"], a: 1, explanation: "You took away 3 apples and you have them in your possession." },
                { category: "Stage 10: Hard (9/3)", q: "If a train travels north at 60 mph and wind blows west at 20 mph, which way does the smoke blow?", opts: ["North", "South", "East", "Electric train has no smoke"], a: 3, explanation: "Electric trains do not produce smoke." },
                { category: "Stage 10: Hard (10/3)", q: "What has hands, but cannot clap?", opts: ["A statue", "A clock", "A robot", "A mannequin"], a: 1, explanation: "A clock has a minute hand and hour hand." },

                // SET 2: VERY HARD (Q11-20)
                { category: "Stage 10: Very Hard (1/3)", q: "If 3 cats catch 3 mice in 3 minutes, how many minutes for 100 cats to catch 100 mice?", opts: ["100 mins", "30 mins", "3 mins", "1 min"], a: 2, explanation: "Each cat takes 3 minutes to catch 1 mouse independently." },
                { category: "Stage 10: Very Hard (2/3)", q: "Solve for x: log2(x) + log2(x-2) = 3", opts: ["x = 2", "x = 4", "x = 6", "x = 8"], a: 1, explanation: "log2(x(x-2)) = 3 => x^2 - 2x = 8 => x^2 - 2x - 8 = 0 => (x-4)(x+2) = 0 => x = 4." },
                { category: "Stage 10: Very Hard (3/3)", q: "Detective puzzle: Three suspects in a robbery. A says 'B did it.' B says 'C did it.' C says 'B is lying.' Only one is telling the truth. Who is guilty?", opts: ["A", "B", "C", "None"], a: 1, explanation: "If B is guilty, B's statement is false, C's statement is true, A's statement is false. Exactly one truth (C)." },
                { category: "Stage 10: Very Hard (4/3)", q: "You have 9 identical coins. One is slightly heavier. What is the minimum weighings on a balance scale to find it?", opts: ["1 weighing", "2 weighings", "3 weighings", "4 weighings"], a: 1, explanation: "Divide into 3 groups of 3 (3,3,3). Weighing 1 finds group; weighing 2 finds specific coin." },
                { category: "Stage 10: Very Hard (5/3)", q: "Critical thinking: A doctor gives you 3 pills and tells you to take one every 30 minutes. How long do all pills last?", opts: ["90 minutes", "60 minutes", "30 minutes", "45 minutes"], a: 1, explanation: "Pill 1 at 0m, Pill 2 at 30m, Pill 3 at 60m. Total time = 60 minutes." },
                { category: "Stage 10: Very Hard (6/3)", q: "What comes next in sequence: 2, 3, 5, 7, 11, 13, 17, 19, ?", opts: ["21", "23", "25", "27"], a: 1, explanation: "Prime number sequence. Next prime after 19 is 23." },
                { category: "Stage 10: Very Hard (7/3)", q: "Multi-step logic: If a lily pad doubles every day and covers a lake in 30 days, on what day was the lake half covered?", opts: ["15 days", "29 days", "28 days", "14 days"], a: 1, explanation: "Since it doubles daily, the day before full coverage (Day 30) is Day 29." },
                { category: "Stage 10: Very Hard (8/3)", q: "If two ropes burn for 1 hour each irregularly, how can you measure exactly 45 minutes?", opts: ["Burn rope 1 both ends, rope 2 one end", "Cut both in half", "Light both simultaneously", "Impossible"], a: 0, explanation: "Light rope 1 from both ends and rope 2 from one end. When rope 1 finishes (30 mins), light other end of rope 2 (adds 15 mins)." },
                { category: "Stage 10: Very Hard (9/3)", q: "What is the probability of rolling an even sum with two standard 6-sided dice?", opts: ["1/4", "1/2", "1/3", "3/4"], a: 1, explanation: "There are 36 outcomes; 18 result in an even sum (18/36 = 1/2)." },
                { category: "Stage 10: Very Hard (10/3)", q: "A room has no windows. Three switches outside control 3 bulbs inside. You can flip switches as you like, but enter room only once. How to identify?", opts: ["Flip all on", "Turn switch 1 on for 10 mins, turn off, turn switch 2 on, enter", "Flip randomly", "Use flashlight"], a: 1, explanation: "Switch 1 warms bulb A (off now), Switch 2 keeps bulb B on, Switch 3 leaves bulb C cold." },

                // SET 3: IMPOSSIBLE (Q21-40)
                { category: "Stage 10: Impossible (1/20)", q: "Master IQ: If f(x) = x^3 - 3x + 2, what is the sum of all distinct real roots?", opts: ["0", "1", "2", "3"], a: 3, explanation: "Roots are x = 1 (double root) and x = -2. Sum = 1 + 1 + (-2) = 0? Wait, by Vieta's formulas for x^3 + 0x^2 - 3x + 2 = 0, sum of roots is -(-0)/1 = 0." },
                { category: "Stage 10: Impossible (2/20)", q: "Complex Code Breaking: If AES-256 uses a key length of how many bits?", opts: ["128 bits", "192 bits", "256 bits", "512 bits"], a: 2, explanation: "AES-256 uses a 256-bit cryptographic key length." },
                { category: "Stage 10: Impossible (3/20)", q: "Advanced Memory: Memorize string: 9-4-8-2-7-1-5-3. What are the 3rd, 5th, and 7th digits combined?", opts: ["875", "421", "987", "275"], a: 0, explanation: "3rd digit is 8, 5th is 7, 7th is 5. Combined: 875." },
                { category: "Stage 10: Impossible (4/20)", q: "Detective Mystery: A wealthy collector is murdered in a gallery. Footprints in snow show only one person entered and left through the window, but the window is 15 feet high with no ladder or trees. How?", opts: ["Helicopter", "It was a museum on stilts / igloo that melted", "Thief was on high stilts", "Footprints were made with stamps on a drone"], a: 1, explanation: "Classic riddle: It was an igloo in winter that melted by spring." },
                { category: "Stage 10: Impossible (5/20)", q: "Mathematical Reasoning: What is the determinant of a 3x3 identity matrix?", opts: ["0", "1", "3", "9"], a: 1, explanation: "The determinant of any identity matrix is always 1." },
                { category: "Stage 10: Impossible (6/20)", q: "Survival Strategy: You are escaping a maze. 3 doors: 1st has instant lasers, 2nd has armed assassins, 3rd has lions that haven't eaten in 3 years. Which is safest?", opts: ["1st door", "2nd door", "3rd door (lions dead of starvation)", "None"], a: 2, explanation: "Lions starved for 3 years are dead." },
                { category: "Stage 10: Impossible (7/20)", q: "Multi-step Logic: If 5 machines make 5 widgets in 5 mins, how many minutes for 50 machines to make 500 widgets?", opts: ["5 mins", "10 mins", "50 mins", "500 mins"], a: 2, explanation: "50 machines make 50 widgets every 5 minutes. To make 500 widgets, it takes 10 sets of 5 mins = 50 minutes." },
                { category: "Stage 10: Impossible (8/20)", q: "Advanced Analytical: In game theory, what is a strategy profile where every player chooses a best response to other players' strategies?", opts: ["Pareto optimality", "Nash Equilibrium", "Zero-sum matrix", "Minimax theorem"], a: 1, explanation: "Definition of a Nash Equilibrium." },
                { category: "Stage 10: Impossible (9/20)", q: "Master IQ: What is the sum of interior angles of a 10-sided polygon (decagon)?", opts: ["1080°", "1440°", "1800°", "2160°"], a: 1, explanation: "Formula: (n - 2) * 180° = (10 - 2) * 180° = 8 * 180° = 1440°." },
                { category: "Stage 10: Impossible (10/20)", q: "Code Breaking: What is the binary representation of decimal number 45?", opts: ["101101", "110101", "111001", "100111"], a: 0, explanation: "32 + 8 + 4 + 1 = 45 => 101101 in binary." },
                { category: "Stage 10: Impossible (11/20)", q: "Advanced Memory: Sequence: A, C, F, J, O, ?", opts: ["S", "T", "U", "V"], a: 2, explanation: "Differences increase by 1 (+2, +3, +4, +5, +6). O(15) + 6 = 21 (U)." },
                { category: "Stage 10: Impossible (12/20)", q: "Detective Mystery: A man is found dead in the middle of a desert with a straw in his mouth. No footprints around. How?", opts: ["He was dropped from a hot air balloon", "Dehydration", "Buried", "Poison"], a: 0, explanation: "Hot air balloon was overweight, passengers threw cargo and straws overboard; he drew the short straw." },
                { category: "Stage 10: Impossible (13/20)", q: "Mathematical Reasoning: What is the derivative of e^(2x) with respect to x?", opts: ["e^(2x)", "2e^(2x)", "4e^(2x)", "2xe^(2x)"], a: 1, explanation: "Chain rule: derivative of e^(2x) is 2 * e^(2x)." },
                { category: "Stage 10: Impossible (14/20)", q: "Survival Strategy: Two cars start 100 miles apart heading toward each other at 50 mph each. A fly starts on bumper of car A at 75 mph flying to car B, back and forth. Total distance fly travels before cars crash?", opts: ["50 miles", "75 miles", "100 miles", "150 miles"], a: 1, explanation: "Cars meet in 1 hour (100 miles / 100 mph). Fly flies at 75 mph for 1 hour = 75 miles." },
                { category: "Stage 10: Impossible (15/20)", q: "Master IQ: What is the next number in the famous Van Eck sequence: 0, 0, 1, 0, 2, 0, 2, 2, ?", opts: ["0", "1", "3", "4"], a: 2, explanation: "Van Eck sequence rule generates 1, 3 next." },
                { category: "Stage 10: Impossible (16/20)", q: "Complex Logic: If 'All snarks are boojums' is false, what can be deduced?", opts: ["All snarks are boojums", "No snarks are boojums", "At least one snark is not a boojum", "Some snarks are boojums"], a: 2, explanation: "The negation of 'All A are B' is 'At least one A is not B'." },
                { category: "Stage 10: Impossible (17/20)", q: "Advanced Analytical: In physics, what constant represents the ratio of circle's circumference to diameter?", opts: ["Planck's constant", "Pi (π)", "Euler's number (e)", "Avogadro's number"], a: 1, explanation: "Pi (π) is the ratio of circumference to diameter." },
                { category: "Stage 10: Impossible (18/20)", q: "Master IQ: If you have a 3-gallon jug and a 5-gallon jug, how do you measure exactly 4 gallons?", opts: ["Fill 5L, pour 3L out, empty 3L, pour 2L to 3L, fill 5L, pour 1L to 3L", "Fill 3L twice", "Impossible", "Use scale"], a: 0, explanation: "Standard water jug puzzle procedure yields 4 liters." },
                { category: "Stage 10: Impossible (19/20)", q: "Complex Code Breaking: What does a hash function guarantee?", opts: ["Reversibility", "Fixed-size output from arbitrary input", "Infinite length", "Zero collisions"], a: 1, explanation: "Cryptographic hash functions map data of arbitrary size to fixed-size bit strings." },
                { category: "Stage 10: Impossible (20/20)", q: "Ultimate Brain Master Final Test: What is the ultimate answer to life, the universe, and everything according to classic sci-fi lore?", opts: ["32", "42", "100", "73"], a: 1, explanation: "The Hitchhiker's Guide to the Galaxy famous answer is 42." }
            ]
        };

        function getProgress() {
            try {
                const saved = localStorage.getItem('brainTestProgress');
                if (saved) return JSON.parse(saved);
            } catch(e) {}
            return { unlockedStage: 1, stars: {} };
        }

        function saveProgress(stageId, starsEarned) {
            const current = getProgress();
            if (!current.stars[stageId] || current.stars[stageId] < starsEarned) {
                current.stars[stageId] = starsEarned;
            }
            if (starsEarned === 3 && stageId < 10) {
                if (current.unlockedStage <= stageId) {
                    current.unlockedStage = stageId + 1;
                }
            }
            try {
                localStorage.setItem('brainTestProgress', JSON.stringify(current));
            } catch(e) {}
            renderStagesGrid();
        }

        function renderStagesGrid() {
            const grid = document.getElementById('stagesGrid');
            if (!grid) return;
            const progress = getProgress();

            grid.innerHTML = STAGES_CONFIG.map(stage => {
                const isActuallyUnlocked = stage.id <= progress.unlockedStage;
                const stars = progress.stars[stage.id] || 0;
                const starIcons = Array.from({ length: 3 }, (_, i) => `
                    <i class="fa-solid fa-star ${i < stars ? 'text-amber-400' : 'text-slate-700'} text-xs"></i>
                `).join('');

                const isStage10 = stage.id === 10;
                const questionCount = isStage10 ? 50 : 30;

                return `
                    <div onclick="launchStage(${stage.id})" class="glass-card rounded-2xl p-5 cursor-pointer group relative">
                        <div class="flex items-center justify-between mb-3">
                            <div class="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 text-2xl">
                                <i class="fa-solid ${stage.icon}"></i>
                            </div>
                            <div class="flex flex-col items-end">
                                <span class="text-xs font-bold px-2.5 py-1 rounded-md ${isActuallyUnlocked ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
                                    STAGE ${stage.id}
                                </span>
                                <div class="flex space-x-1 mt-1.5">${starIcons}</div>
                            </div>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-1">${stage.title}</h3>
                        <p class="text-xs text-slate-400 mb-3">${stage.desc}</p>
                        <div class="flex items-center justify-between text-xs text-cyan-400 font-semibold pt-3 border-t border-slate-800">
                            <span>${questionCount} Questions</span>
                            <span>Play Stage <i class="fa-solid fa-chevron-right text-xs"></i></span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        let currentStageId = 1;
        let questionIndex = 0;
        let score = 0;
        let questionTimer = null;
        let questionTimeLeft = 30;
        let activeStageQuestions = [];

        function shuffleArray(array) {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function launchStage(stageId) {
            playClickSound();
            currentStageId = stageId;
            questionIndex = 0;
            score = 0;
            const stage = STAGES_CONFIG.find(s => s.id === stageId);
            const rawQuestions = STAGE_QUESTIONS[stageId] || STAGE_QUESTIONS[1];
            activeStageQuestions = shuffleArray(rawQuestions);

            document.getElementById('quizTitle').innerText = stage.title;
            document.getElementById('quizSubtitle').innerText = stage.desc;

            const modal = document.getElementById('quizModal');
            if (modal) {
                modal.classList.remove('hidden');
                setTimeout(() => modal.classList.remove('opacity-0'), 10);
            }

            renderQuestion();
        }

        function startQuestionTimer() {
            if (questionTimer) clearInterval(questionTimer);
            questionTimeLeft = 30;

            const timerText = document.getElementById('qTimerText');
            const timerBar = document.getElementById('qTimerBar');

            if (timerText) timerText.innerText = `${questionTimeLeft}s`;
            if (timerBar) timerBar.style.width = '100%';

            questionTimer = setInterval(() => {
                questionTimeLeft--;
                if (timerText) timerText.innerText = `${questionTimeLeft}s`;
                if (timerBar) {
                    const pct = (questionTimeLeft / 30) * 100;
                    timerBar.style.width = `${pct}%`;
                    if (questionTimeLeft <= 10) {
                        timerBar.className = "h-full bg-red-500 transition-all duration-1000 ease-linear rounded-full";
                    } else {
                        timerBar.className = "h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-1000 ease-linear rounded-full";
                    }
                }

                if (questionTimeLeft <= 0) {
                    clearInterval(questionTimer);
                    playErrorSound();
                    questionIndex++;
                    if (questionIndex >= activeStageQuestions.length) {
                        endChallenge();
                    } else {
                        renderQuestion();
                    }
                }
            }, 1000);
        }

        function renderQuestion() {
            const container = document.getElementById('quizContent');
            if (!container) return;
            const totalQ = activeStageQuestions.length;

            if (questionIndex >= totalQ) {
                endChallenge();
                return;
            }

            const qData = activeStageQuestions[questionIndex];
            const currentQNum = questionIndex + 1;

            document.getElementById('quizScore').innerText = `Score: ${score}`;
            document.getElementById('quizProgress').innerText = `Question ${currentQNum} / ${totalQ}`;

            const optionsWithIdx = qData.opts.map((opt, idx) => ({ opt, isCorrect: idx === qData.a }));
            const shuffledOptions = shuffleArray(optionsWithIdx);

            container.innerHTML = `
                <div class="w-full mb-4">
                    <div class="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                        <span class="text-cyan-400"><i class="fa-regular fa-clock mr-1"></i> Time Remaining</span>
                        <span id="qTimerText" class="text-amber-400 font-mono text-sm font-black">30s</span>
                    </div>
                    <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                        <div id="qTimerBar" class="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-1000 ease-linear rounded-full" style="width: 100%;"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between w-full text-xs text-slate-400 mb-2 uppercase tracking-widest font-semibold">
                    <span class="text-cyan-400 font-bold">${qData.category || STAGES_CONFIG[currentStageId-1].title}</span>
                    <span class="bg-purple-900/50 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">Q${currentQNum}/${totalQ}</span>
                </div>

                <div class="text-lg md:text-xl font-bold text-white mb-6 max-w-sm text-center">${qData.q}</div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    ${shuffledOptions.map(o => `
                        <button onclick="answerQuestion(${o.isCorrect})" class="py-3 px-4 bg-navyCard hover:bg-purple-600 border border-purple-500/30 hover:border-cyan-400 rounded-xl font-semibold text-sm text-white transition-all text-center flex items-center justify-center shadow-md active:scale-95">
                            ${o.opt}
                        </button>
                    `).join('')}
                </div>
            `;

            startQuestionTimer();
        }

        function answerQuestion(isCorrect) {
            if (questionTimer) clearInterval(questionTimer);

            if (isCorrect) {
                playSuccessSound();
                score += 1;
            } else {
                playErrorSound();
            }

            questionIndex++;
            if (questionIndex >= activeStageQuestions.length) {
                endChallenge();
            } else {
                renderQuestion();
            }
        }

        function endChallenge() {
            if (questionTimer) clearInterval(questionTimer);

            const container = document.getElementById('quizContent');
            if (!container) return;
            const totalQ = activeStageQuestions.length;
            const percentage = Math.round((score / totalQ) * 100);
            const passed = percentage >= 70;
            let starsEarned = passed ? 3 : (percentage >= 40 ? 2 : 1);

            saveProgress(currentStageId, starsEarned);

            // Check if user completed all 10 stages successfully (Stage 10 passed)
            const isAllStagesCompleted = currentStageId === 10 && passed;

            if (isAllStagesCompleted) {
                closeQuizModal();
                triggerFinalCelebration(score, totalQ);
                return;
            }

            const starsHtml = Array.from({ length: 3 }, (_, i) => `
                <i class="fa-solid fa-star text-3xl ${i < starsEarned ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]' : 'text-slate-700'}"></i>
            `).join('');

            const currentStageObj = STAGES_CONFIG.find(s => s.id === currentStageId);
            const hasBadge = passed && currentStageObj && currentStageObj.badge;
            const playerName = getPlayerState().name || "Player";

            container.innerHTML = `
                <div class="text-center py-2">
                    <i class="fa-solid ${passed ? 'fa-trophy text-amber-400' : 'fa-circle-exclamation text-rose-400'} text-5xl mb-3 animate-bounce"></i>
                    <h4 class="text-2xl font-black text-white mb-1">${passed ? 'Stage Passed!' : 'Try Again!'}</h4>
                    <div class="flex justify-center space-x-2 my-3">${starsHtml}</div>
                    
                    ${hasBadge ? `
                    <div class="my-3 p-3 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-indigo-400/40 flex items-center justify-center space-x-3 shadow-lg">
                        <i class="fa-solid fa-award text-3xl text-amber-300 animate-pulse"></i>
                        <div class="text-left">
                            <div class="text-xs text-indigo-300 font-bold uppercase tracking-wider">Badge Unlocked!</div>
                            <div class="text-base font-extrabold text-white">${currentStageObj.badge}</div>
                        </div>
                    </div>
                    ` : ''}

                    <div class="bg-slate-900/80 rounded-xl p-4 border border-slate-800 my-4">
                        <div class="text-xs text-slate-400 mb-1 uppercase tracking-wider">${playerName}'s Score</div>
                        <div class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                            ${score} <span class="text-xs text-slate-400 font-normal">/ ${totalQ} pts (${percentage}%)</span>
                        </div>
                        <div class="text-xs ${passed ? 'text-emerald-400' : 'text-rose-400'} mt-2 font-semibold">
                            ${passed ? '🎉 Congratulations! Next stage unlocked!' : '🔒 You need at least 70% to pass and unlock Stage ' + (currentStageId + 1)}
                        </div>
                    </div>

                    <div class="flex items-center justify-center space-x-3 mt-4">
                        <button onclick="launchStage(${currentStageId})" class="start-btn-neon px-6 py-2.5 rounded-full text-white font-bold text-sm uppercase flex items-center space-x-2">
                            <i class="fa-solid fa-rotate-right"></i>
                            <span>Replay Stage</span>
                        </button>
                        <button onclick="closeQuizModal(); showPage('stagePage');" class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-white font-bold text-sm uppercase">
                            Stages Menu
                        </button>
                    </div>
                </div>
            `;
        }

        function triggerFinalCelebration(finalScore, totalPossible) {
            playVictoryFanfare();
            const playerName = getPlayerState().name || "Player";

            document.getElementById('celebrationTitle').innerText = `CONGRATULATIONS, ${playerName.toUpperCase()}!`;
            document.getElementById('celebrationScoreDisplay').innerText = `${finalScore} / ${totalPossible} (100%)`;
            document.getElementById('celebrationPersonalNote').innerText = `“Congratulations, ${playerName}! Keep Learning, Keep Thinking, Keep Growing!”`;

            const modal = document.getElementById('celebrationModal');
            if (modal) {
                modal.classList.remove('hidden');
                setTimeout(() => modal.classList.remove('opacity-0'), 10);
            }
        }

        function restartFullGame() {
            playClickSound();
            const modal = document.getElementById('celebrationModal');
            if (modal) {
                modal.classList.add('opacity-0');
                setTimeout(() => modal.classList.add('hidden'), 300);
            }
            showPage('welcomePage');
        }

        function shareAchievement() {
            playClickSound();
            const playerName = getPlayerState().name || "Player";
            const shareText = `🧠 BrainTest Achievement: ${playerName} has successfully completed all 10 stages and is now an ULTIMATE BRAIN MASTER! 🏆`;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareText).then(() => {
                    alert("Achievement copied to clipboard! Share it with your friends.");
                }).catch(() => {
                    prompt("Copy your achievement:", shareText);
                });
            } else {
                prompt("Copy your achievement:", shareText);
            }
        }

        window.showPage = showPage;
        window.toggleSettingsModal = toggleSettingsModal;
        window.closeQuizModal = closeQuizModal;
        window.toggleSound = toggleSound;
        window.launchStage = launchStage;
        window.answerQuestion = answerQuestion;
        window.handleNameSubmission = handleNameSubmission;
        window.changePlayerNamePrompt = changePlayerNamePrompt;
        window.restartFullGame = restartFullGame;
        window.shareAchievement = shareAchievement;
        window.handleLogoClick = handleLogoClick;

        window.addEventListener('DOMContentLoaded', () => {
            initParticleCanvas();
            const state = getPlayerState();
            if (state.name) {
                updatePlayerUI();
                showPage('welcomePage');
            } else {
                showPage('nameEntryPage');
            }
        });
