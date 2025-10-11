import {useCallback, useEffect, useRef, useState} from 'react'
import patterns from "./patterns.json"
import './App.css'
import {
    TbHelpSquareRounded,
    TbHelpSquareFilled,
    TbSquareRoundedX,
    TbSquareRoundedXFilled,
    TbSpace,
    TbSquareRoundedArrowUpFilled,
    TbSquareRoundedArrowDownFilled,
    TbSquareRoundedLetterRFilled,
    TbSquareRoundedLetterCFilled,
    TbSquareRoundedLetterXFilled,
    TbSquareRoundedLetterIFilled,
    TbSquareRoundedLetterHFilled
} from "react-icons/tb";

function CellAnimation({states}) {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % states.length)
        }, 999)

        return () => clearInterval(timer)
    }, [states])

    return (
        <div className="small-grid">
            {states[current].map((cell, i) => (
                <span key={i} className={cell ? "alive" : "dead"}> </span>
            ))}
        </div>
    )
}

function Control({icon, text}) {
    return (
        <div className="control">
            <span className="control-icon">{icon}</span>
            <span className="control-text">{text}</span>
        </div>
    );
}

function HelpModal({onClose}) {
    const [hover, setHover] = useState(false)

    return (
        <div className="help-modal">
            <div className="icon close-modal" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                 onClick={onClose}>
                {hover ? <TbSquareRoundedXFilled/> : <TbSquareRoundedX/>}
            </div>
            <div className="help-modal-content">
                <h1><strong>Conway's Game of Life </strong></h1>
                <p>
                    Conway’s Game of Life is a zero-player simulation created by mathematician John Conway in 1970. It’s
                    a fascinating display that shows how simple rules can lead to complex, evolving patterns that look
                    almost
                    alive.

                    The game takes place on a grid of cells, where each cell is either alive or dead. With each
                    “generation,” the grid updates automatically based on these rules:

                    <div className="small-grid">
                        <span> 1 </span> <span> 2 </span> <span> 3 </span>
                        <span> 4 </span> <span className="alive">   </span> <span> 5 </span>
                        <span> 6 </span> <span> 7 </span> <span> 8 </span>
                    </div>
                    <sub> Each cell has 8 neighbours. </sub>

                    <div className="rules">
                        <div>
                            <CellAnimation states={[[1, 0, 0, 0, 1, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0]]}/>
                            <sub> A live cell with fewer than 2 live neighbours dies, through underpopulation.</sub>
                        </div>
                        <div>
                            <CellAnimation states={[[1, 0, 0, 0, 1, 1, 0, 1, 1], [1, 0, 0, 0, 0, 1, 0, 1, 1]]}/>
                            <sub> A live cell with more than 3 live neighbours dies, through overpopulation.</sub>
                        </div>

                        <div>
                            <CellAnimation states={[[1, 0, 0, 0, 0, 1, 1, 0, 0], [1, 0, 0, 0, 1, 1, 1, 0, 0]]}/>
                            <sub> A dead cell with exactly 3 live neighbours comes alive, through reproduction.</sub>
                        </div>

                        <div>
                            <CellAnimation states={[[1, 0, 1, 0, 1, 0, 1, 0, 0], [1, 0, 1, 0, 1, 0, 1, 0, 0]]}/>
                            <sub> A live cell with 2 or 3 live neighbours remains the same.</sub>
                        </div>
                    </div>

                    From just a few starting cells, entire colonies can grow, move, or collapse, all without any direct
                    control from you. It’s like watching a digital ecosystem evolve in real time!
                </p>
                <h3> Controls </h3>
                <div className="control-container">
                    <div className="controls">
                        <Control icon={<TbSpace/>} text="Play/Pause Simulation"/>
                        <Control icon={<TbSquareRoundedLetterRFilled/>} text="Randomize Starting Pattern"/>
                        <Control icon={<TbSquareRoundedArrowUpFilled/>} text="Increase Simulation Speed"/>
                        <Control icon={<TbSquareRoundedArrowDownFilled/>} text="Decrease Simulation Speed"/>
                        <Control icon={<TbSquareRoundedLetterCFilled/>} text="Clear Grid"/>
                        <Control icon={<TbSquareRoundedLetterXFilled/>} text="Randomize Whole Grid"/>
                        <Control icon={<TbSquareRoundedLetterIFilled/>} text="Show/Hide Info Menu"/>
                        <Control icon={<TbSquareRoundedLetterHFilled/>} text="Show/Hide Help Menu"/>
                    </div>
                </div>

            </div>

        </div>
    );
}

function InfoModal({generation, live, name}) {
    return (
        <div className="info-modal">
            <p><strong> pattern: {name}</strong></p>
            <p><strong> generation: {generation}</strong></p>
            <p><strong> live cells: {live}</strong></p>
        </div>
    )
}

function App() {

    const MIN_ROWS = 20
    const MIN_COLS = 20
    const CELL_SIZE = 15

    const [currentPattern, setCurrentPattern] = useState("")
    const [generation, setGeneration] = useState(1)
    const [live, setLive] = useState(0)

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ]

    const generateEmptyGrid = (rows, cols) =>
        Array.from({length: rows}, () => Array(cols).fill(0));

    const getGridSize = (width, height) => ({
        rows: Math.max(Math.floor(height / CELL_SIZE), MIN_ROWS),
        cols: Math.max(Math.floor(width / CELL_SIZE), MIN_COLS),
    });

    const populateGrid = ((rows, cols) => {
        const patternKeys = Object.keys(patterns)
        const patternName = patternKeys[Math.floor(Math.random() * patternKeys.length)]
        setCurrentPattern(patternName)

        console.log(patternName)
        const pattern = patterns[patternName]

        const newGrid = generateEmptyGrid(rows, cols);

        const centerR = Math.floor(rows / 2)
        const centerC = Math.floor(cols / 2)

        pattern.forEach(([dr, dc]) => {
            const rr = centerR + dr
            const cc = centerC + dc
            if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
                newGrid[rr][cc] = 1;
            }
        });

        return newGrid
    })

    const randomizeGrid = (rows, cols) => {
        setCurrentPattern("random")
        return Array.from({length: rows}, () =>
            Array.from({length: cols}, () => (Math.random() > 0.7 ? 1 : 0))
        )
    }

    const [grid, setGrid] = useState(() => {
        const {rows, cols} = getGridSize(window.innerWidth, window.innerHeight);
        return populateGrid(rows, cols);
    });
    const [running, setRunning] = useState(false)
    const [speed, setSpeed] = useState(100)
    const canvasRef = useRef(null)

    const [hover, setHover] = useState(false)
    const [showHelpModal, setShowHelpModal] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(true)

    const generateNextGrid = useCallback((g, rows, cols) => {

        let alive = 0
        let changed = false;

        const newGrid =  g.map((row, r) =>
            row.map((cell, c) => {
                let neighbours = 0;
                directions.forEach(([x, y]) => {
                    const dx = r + x
                    const dy = c + y
                    if (0 <= dx && dx < rows && 0 <= dy && dy < cols) {
                        neighbours += g[dx][dy]
                    }
                })
                let newCell = cell;
                if (cell === 1 && (neighbours < 2 || neighbours > 3)) newCell = 0
                if (cell === 0 && neighbours === 3) newCell = 1

                if (newCell !== cell) changed = true;
                if (newCell) alive++;

                return newCell
            }))
        return {newGrid, alive, changed}
    }, [directions])

    const toggleSimulation = () => {
        setRunning((prev) => !prev);
    }

    const toggleHelpModal = () => {
        setShowHelpModal((prev) => !prev)
    }

    const toggleInfoModal = () => {
        setShowInfoModal((prev) => !prev)
    }

    const resetStats = () => {
        setGeneration(1);
        setLive(0);
    }

    useEffect(() => {
        if (!running) return;

        const interval = setInterval(() => {
            const {rows, cols} = getGridSize(window.innerWidth, window.innerHeight);
            setGrid((g) => {
                const {newGrid, alive, changed} = generateNextGrid(g, rows, cols);

                setLive(alive);
                if (changed) setGeneration((prev) => prev + 1);

                return newGrid;
            });
        }, speed);

        return () => clearInterval(interval)
    }, [running, speed, generateNextGrid])

    useEffect(() => {
        setRunning(true)
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            e.preventDefault()
            const {rows, cols} = getGridSize(window.innerWidth, window.innerHeight);
            if (e.code === "Space") {
                toggleSimulation();
            } else if (e.code === "ArrowUp") {
                setSpeed((prev) => (Math.max(prev - 50, 50)));
            } else if (e.code === "ArrowDown") {
                setSpeed((prev) => (Math.min(prev + 50, 500)));
            } else if (e.code === "KeyR") {
                setRunning(false)
                resetStats();
                setGrid(populateGrid(rows, cols));
            } else if (e.code === "KeyC") {
                setRunning(false)
                resetStats();
                setGrid(generateEmptyGrid(rows, cols));
            } else if (e.code === "KeyX") {
                setRunning(false)
                resetStats();
                setGrid(randomizeGrid(rows, cols))
                setRunning(true)
            } else if (e.code === "KeyH") {
                toggleHelpModal();
            } else if (e.code === "KeyI") {
                toggleInfoModal();
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        const handleResize = () => {
            setRunning(false)
            const {rows, cols} = getGridSize(window.innerWidth, window.innerHeight);
            setGrid((prev) => {
                const newGrid = generateEmptyGrid(rows, cols);
                prev.forEach((row, r) => {
                    row.forEach((cell, c) => {
                        if (cell && 0 <= c && c < rows && 0 <= r && r < cols) {
                            newGrid[r][c] = 1
                        }
                    })
                })
                return newGrid
            })
            setRunning(true)
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return;
        const ctx = canvas.getContext('2d')

        const {rows, cols} = getGridSize(window.innerWidth, window.innerHeight);
        canvas.width = cols * CELL_SIZE;
        canvas.height = rows * CELL_SIZE;

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        grid.forEach((row, r) =>
            row.forEach((cell, c) => {
                if (cell) {
                    ctx.fillStyle = "#ccc"
                    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
                ctx.strokeStyle = "#444";
                ctx.lineWidth = 0.5;
                ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            })
        );
    }, [grid])


    return (
        <div style={{textAlign: "center"}} className="App">
            <div className="icon help-icon" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                 onClick={toggleHelpModal}>
                {hover ? <TbHelpSquareFilled/> : <TbHelpSquareRounded/>}
            </div>
            {showHelpModal && <HelpModal onClose={toggleHelpModal}/>}
            {showInfoModal && <InfoModal generation={generation} live={live} name={currentPattern}/>}
            <canvas ref={canvasRef}/>
        </div>
    );
}

export default App
