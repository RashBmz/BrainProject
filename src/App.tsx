import React, { useState, useEffect, useRef } from 'react';
import { Brain, Calculator, Puzzle, Trophy, ChevronRight, ArrowLeft, Timer, Swords, Square, Circle, Triangle, Star } from 'lucide-react';

function ZombieMathGame({ onBack }: { onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState('');
  const [gameActive, setGameActive] = useState(true);
  const [zombies, setZombies] = useState<Array<{
    id: number;
    position: number;
    lane: number;
    num1: number;
    num2: number;
    operator: string;
    solution: number;
    frame: number;
  }>>([]);
  const [health, setHealth] = useState(100);
  const gameLoopRef = useRef<number>();
  const [gameSpeed, setGameSpeed] = useState(55);
  const [spawnRate, setSpawnRate] = useState(3000);
  const [lastSpawnTime, setLastSpawnTime] = useState(Date.now());
  const [playerFrame, setPlayerFrame] = useState(0);
  const LANES = [20, 40, 60, 80];

  const generateProblem = () => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, solution;

    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        solution = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * num1);
        solution = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        solution = num1 * num2;
        break;
      default:
        num1 = 0;
        num2 = 0;
        solution = 0;
    }

    return { num1, num2, operator, solution };
  };

  const spawnZombie = () => {
    const problem = generateProblem();
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const newZombie = {
      id: Date.now(),
      position: 0,
      lane,
      frame: 0,
      ...problem
    };
    setZombies(prev => [...prev, newZombie]);
  };

  const updateGame = () => {
    if (!gameActive) return;

    setZombies(prev => {
      const updated = prev.map(zombie => ({
        ...zombie,
        position: zombie.position + 0.45,
        frame: (zombie.frame + 1) % 4
      }));

      updated.forEach(zombie => {
        if (zombie.position >= 100) {
          setHealth(h => {
            const newHealth = h - 20;
            if (newHealth <= 0) {
              setGameActive(false);
            }
            return newHealth;
          });
        }
      });

      return updated.filter(zombie => zombie.position < 100);
    });

    setPlayerFrame(prev => (prev + 1) % 4);

    const currentTime = Date.now();
    if (currentTime - lastSpawnTime > spawnRate) {
      spawnZombie();
      setLastSpawnTime(currentTime);
      setSpawnRate(prev => Math.max(prev * 0.95, 1500));
      setGameSpeed(prev => Math.min(prev + 1, 100));
    }
  };

  useEffect(() => {
    spawnZombie();
    gameLoopRef.current = setInterval(updateGame, gameSpeed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameSpeed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameActive) return;

    const userAnswer = parseInt(answer);
    const zombieHit = zombies.find(zombie => zombie.solution === userAnswer);

    if (zombieHit) {
      setZombies(prev => prev.filter(z => z.id !== zombieHit.id));
      setScore(prev => prev + 1);
    }

    setAnswer('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-semibold">Score: {score}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-32 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${health}%` }}
              />
            </div>
            <span className="text-xl font-semibold">{health}%</span>
          </div>
        </div>

        {gameActive ? (
          <>
            <div className="relative h-96 bg-[url('https://images.unsplash.com/photo-1509248961158-e54f6934749c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center rounded-lg mb-6 overflow-hidden">
              {LANES.map((lane) => (
                <div
                  key={lane}
                  className="absolute w-full h-16 bg-gray-800 bg-opacity-30"
                  style={{ top: `${lane}%`, transform: 'translateY(-50%)' }}
                />
              ))}

              <div 
                className="absolute right-4 bottom-4 w-24 h-32"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1580477667995-2b94f01c9516?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80')",
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  transform: 'scaleX(-1)',
                }}
              />

              {zombies.map(zombie => (
                <div
                  key={zombie.id}
                  className="absolute flex flex-col items-center transition-all duration-300"
                  style={{ 
                    left: `${zombie.position}%`,
                    top: `${zombie.lane}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div 
                    className="w-20 h-28 relative"
                    style={{
                      backgroundImage: "url('https://images.unsplash.com/photo-1509557965875-b88c97052f81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80')",
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      filter: 'hue-rotate(90deg) saturate(150%)',
                    }}
                  >
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black bg-opacity-70 rounded-lg p-2 text-white text-sm whitespace-nowrap">
                      {zombie.num1} {zombie.operator} {zombie.num2}
                    </div>
                  </div>
                </div>
              ))}

              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-4 text-2xl text-center border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Résolvez pour tirer!"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
              >
                Tirer!
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold">Game Over!</h3>
            <p className="text-xl">Score final : {score} zombies</p>
            <button
              onClick={() => window.location.reload()}
              className="py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
            >
              Rejouer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MentalCalculationGame({ onBack }: { onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState('');
  const [problem, setProblem] = useState({ num1: 0, num2: 0, operator: '+', solution: 0 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);

  const generateProblem = () => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, solution;

    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * 100);
        num2 = Math.floor(Math.random() * 100);
        solution = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 100);
        num2 = Math.floor(Math.random() * num1);
        solution = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12);
        num2 = Math.floor(Math.random() * 12);
        solution = num1 * num2;
        break;
      default:
        num1 = 0;
        num2 = 0;
        solution = 0;
    }

    setProblem({ num1, num2, operator, solution });
  };

  useEffect(() => {
    generateProblem();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameActive(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameActive) return;

    const userAnswer = parseInt(answer);
    if (userAnswer === problem.solution) {
      setScore((prev) => prev + 1);
    }
    setAnswer('');
    generateProblem();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-semibold">Score: {score}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Timer className="w-6 h-6 text-red-500" />
            <span className="text-xl font-semibold">{timeLeft}s</span>
          </div>
        </div>

        {gameActive ? (
          <>
            <div className="text-4xl font-bold text-center mb-8">
              {problem.num1} {problem.operator} {problem.num2} = ?
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-4 text-2xl text-center border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Votre réponse"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
              >
                Valider
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold">Temps écoulé !</h3>
            <p className="text-xl">Score final : {score}</p>
            <button
              onClick={() => window.location.reload()}
              className="py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
            >
              Rejouer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MemoryGame({ onBack }: { onBack: () => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const colors = [
    { bg: 'bg-red-500', hover: 'hover:bg-red-600' },
    { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { bg: 'bg-green-500', hover: 'hover:bg-green-600' },
    { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' }
  ];

  const addToSequence = () => {
    const newNumber = Math.floor(Math.random() * 4);
    setSequence(prev => [...prev, newNumber]);
  };

  const playSequence = async () => {
    setIsPlaying(true);
    setPlayerSequence([]);

    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const button = document.getElementById(`color-${sequence[i]}`);
      if (button) {
        button.classList.add('brightness-150', 'scale-110');
        await new Promise(resolve => setTimeout(resolve, 300));
        button.classList.remove('brightness-150', 'scale-110');
      }
    }

    setIsPlaying(false);
  };

  const handleColorClick = (colorIndex: number) => {
    if (isPlaying || gameOver) return;

    const newPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;
    if (colorIndex !== sequence[currentIndex]) {
      setGameOver(true);
      setHighScore(Math.max(score, highScore));
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      setScore(prev => prev + 1);
      setTimeout(() => {
        addToSequence();
      }, 1000);
    }
  };

  useEffect(() => {
    if (sequence.length > 0 && !isPlaying && playerSequence.length === 0) {
      setTimeout(playSequence, 1000);
    }
  }, [sequence, playerSequence]);

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setGameOver(false);
    setTimeout(() => {
      addToSequence();
    }, 500);
  };

  useEffect(() => {
    startGame();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-semibold">Score: {score}</span>
          </div>
          <div className="text-sm text-gray-600">
            Meilleur score: {highScore}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {colors.map((color, index) => (
            <button
              key={index}
              id={`color-${index}`}
              onClick={() => handleColorClick(index)}
              disabled={isPlaying || gameOver}
              className={`${color.bg} ${color.hover} h-32 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          ))}
        </div>

        {gameOver ? (
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-red-600">Game Over!</h3>
            <p className="text-lg">Score final: {score}</p>
            <button
              onClick={startGame}
              className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
            >
              Rejouer
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-600 text-lg">
            {isPlaying ? "Regardez la séquence..." : "Répétez la séquence !"}
          </div>
        )}
      </div>
    </div>
  );
}

function LogicGame({ onBack }: { onBack: () => void }) {
  const [currentPuzzle, setCurrentPuzzle] = useState<{
    numbers: number[];
    answer: number;
    hint: string;
  }>({ numbers: [], answer: 0, hint: '' });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);

  const generatePuzzle = () => {
    const puzzleTypes = [
      // Arithmetic sequence
      () => {
        const start = Math.floor(Math.random() * 10);
        const diff = Math.floor(Math.random() * 5) + 1;
        const numbers = Array.from({ length: 4 }, (_, i) => start + (diff * i));
        return {
          numbers,
          answer: numbers[numbers.length - 1] + diff,
          hint: "Trouvez le prochain nombre dans la suite arithmétique"
        };
      },
      // Geometric sequence
      () => {
        const start = Math.floor(Math.random() * 5) + 1;
        const ratio = Math.floor(Math.random() * 2) + 2;
        const numbers = Array.from({ length: 4 }, (_, i) => start * Math.pow(ratio, i));
        return {
          numbers,
          answer: numbers[numbers.length - 1] * ratio,
          hint: "Trouvez le prochain nombre dans la suite géométrique"
        };
      },
      // Fibonacci-like sequence
      () => {
        const numbers = [
          Math.floor(Math.random() * 5) + 1,
          Math.floor(Math.random() * 5) + 2
        ];
        for (let i = 2; i < 4; i++) {
          numbers.push(numbers[i - 1] + numbers[i - 2]);
        }
        return {
          numbers,
          answer: numbers[numbers.length - 1] + numbers[numbers.length - 2],
          hint: "Chaque nombre est la somme des deux précédents"
        };
      }
    ];

    const puzzleGenerator = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
    setCurrentPuzzle(puzzleGenerator());
  };

  useEffect(() => {
    generatePuzzle();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameActive) return;

    const answer = parseInt(userAnswer);
    if (answer === currentPuzzle.answer) {
      setScore(prev => prev + Math.ceil(streak * 1.5));
      setStreak(prev => prev + 1);
      setFeedback('Correct ! 🎉');
      generatePuzzle();
    } else {
      setStreak(0);
      setFeedback('Incorrect, essayez encore !');
    }
    setUserAnswer('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-semibold">Score: {score}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-purple-600">Série: {streak}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="w-6 h-6 text-red-500" />
              <span className="text-xl font-semibold">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {gameActive ? (
          <>
            <div className="text-center mb-8">
              <p className="text-sm text-gray-600 mb-4">{currentPuzzle.hint}</p>
              <div className="flex justify-center items-center space-x-4">
                {currentPuzzle.numbers.map((number, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center text-2xl font-bold text-purple-700"
                  >
                    {number}
                  </div>
                ))}
                <div className="w-16 h-16 bg-purple-200 rounded-lg flex items-center justify-center text-2xl font-bold text-purple-700">
                  ?
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full p-4 text-2xl text-center border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Votre réponse"
                autoFocus
              />
              <div className="h-6 text-center">
                {feedback && (
                  <span className={feedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}>
                    {feedback}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
              >
                Valider
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold">Temps écoulé !</h3>
            <p className="text-xl">Score final : {score}</p>
            <button
              onClick={() => window.location.reload()}
              className="py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
            >
              Rejouer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GameSelector({ onSelect }: { onSelect: (game: string) => void }) {
  const games = [
    {
      title: "Calcul Classique",
      icon: <Calculator className="w-8 h-8" />,
      description: "Résolvez des calculs contre la montre"
    },
    {
      title: "Zombie Math",
      icon: <Swords className="w-8 h-8" />,
      description: "Combattez les zombies avec vos calculs"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {games.map((game) => (
        <div
          key={game.title}
          className="bg-white rounded-xl shadow-lg p-6 transform transition duration-300 hover:scale-105 cursor-pointer"
          onClick={() => onSelect(game.title)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              {game.icon}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {game.title}
          </h3>
          <p className="text-gray-600">
            {game.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedMathGame, setSelectedMathGame] = useState<string | null>(null);
  const [globalScore, setGlobalScore] = useState(0);

  const games = [
    {
      title: "Calcul Mental",
      icon: <Calculator className="w-8 h-8" />,
      description: "Améliorez votre rapidité en calcul mental"
    },
    {
      title: "Logique",
      icon: <Puzzle className="w-8 h-8" />,
      description: "Résolvez des énigmes et des puzzles logiques"
    },
    {
      title: "Mémoire",
      icon: <Brain className="w-8 h-8" />,
      description: "Exercez votre mémoire avec Simon Says"
    }
  ];

  const renderContent = () => {
    if (selectedGame === "Calcul Mental") {
      if (!selectedMathGame) {
        return (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            <h2 className="text-2xl font-bold text-center mb-8">Choisissez votre mode de jeu</h2>
            <GameSelector onSelect={setSelectedMathGame} />
          </div>
        );
      }
      
      if (selectedMathGame === "Calcul Classique") {
        return <MentalCalculationGame onBack={() => setSelectedMathGame(null)} />;
      }
      
      if (selectedMathGame === "Zombie Math") {
        return <ZombieMathGame onBack={() => setSelectedMathGame(null)} />;
      }
    }

    if (selectedGame === "Mémoire") {
      return <MemoryGame onBack={() => setSelectedGame(null)} />;
    }

    if (selectedGame === "Logique") {
      return  <LogicGame onBack={() => setSelectedGame(null)} />;
    }

    return (
      <>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Entraînez votre cerveau, libérez-vous de la brainrot
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des exercices quotidiens pour stimuler votre esprit et améliorer vos capacités cognitives
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {games.map((game) => (
            <div
              key={game.title}
              className="bg-white rounded-xl shadow-lg p-6 transform transition duration-300 hover:scale-105 cursor-pointer"
              onClick={() => setSelectedGame(game.title)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                  {game.icon}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {game.title}
              </h3>
              <p className="text-gray-600">
                {game.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Pourquoi entraîner votre cerveau ?
            </h3>
            <p className="text-gray-600 mb-6">
              L'entraînement cérébral régulier peut améliorer votre concentration, 
              votre mémoire et vos capacités de résolution de problèmes. 
              Commencez dès aujourd'hui pour un esprit plus vif et plus agile.
            </p>
            <img
              src="https://images.unsplash.com/photo-1565843708714-52ecf69ab81f?auto=format&fit=crop&w=800&q=80"
              alt="Brain Training Concept"
              className="rounded-lg w-full h-48 object-cover"
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Guérir</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-gray-600">Score: {globalScore}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;