import {useCallback, useEffect, useRef, useState} from 'react'
import patterns from "./patterns.json"
import './App.css'

function App() {

    const MIN_ROWS = 20
    const MIN_COLS = 20
    const CELL_SIZE = 15

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ]

    const generateEmptyGrid = (rows, cols) =>
        Array.from({ length: rows }, () => Array(cols).fill(0));

    const getGridSize = (width, height) => ({
        rows: Math.max(Math.floor(height / CELL_SIZE), MIN_ROWS),
        cols: Math.max(Math.floor(width / CELL_SIZE), MIN_COLS),
    });

    const populateGrid = ((rows, cols) => {
        const patternKeys = Object.keys(patterns)
        const patternName = patternKeys[Math.floor(Math.random() * patternKeys.length)]

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
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => (Math.random() > 0.7 ? 1 : 0))
        )
    }

    const [grid, setGrid] = useState(() => {
        const { rows, cols } = getGridSize(window.innerWidth, window.innerHeight);
        return populateGrid(rows, cols);
    });
    const [running, setRunning] = useState(false)
    const [speed, setSpeed] = useState(100)
    const canvasRef = useRef(null)


    const generateNextGrid = useCallback((g, rows, cols) => {
        return g.map((row, r) =>
            row.map((cell, c) => {
                let neighbours = 0;
                directions.forEach(([x, y]) => {
                    const dx = r + x
                    const dy = c + y
                    if (0 <= dx && dx < rows && 0 <= dy && dy < cols) {
                        neighbours += g[dx][dy]
                    }
                })
                if (cell === 1 && (neighbours < 2 || neighbours > 3)) return 0
                if (cell === 0 && neighbours === 3) return 1
                return cell
            }))
    }, [directions])

    const toggleSimulation = () => {
        setRunning((prev) => !prev);
    }

    useEffect(() => {
        if (!running) return;

        const interval = setInterval(() => {
            const { rows, cols } = getGridSize(window.innerWidth, window.innerHeight);
            setGrid((g) => generateNextGrid(g, rows, cols));
        }, speed);

        return () => clearInterval(interval)
    }, [running, speed, generateNextGrid])

    useEffect(() => {
        setRunning(true)
    },[])

    useEffect(() => {
        const handleKeyDown = (e) => {
            e.preventDefault()
            const { rows, cols } = getGridSize(window.innerWidth, window.innerHeight);
            if (e.code === "Space") {
                toggleSimulation();
            } else if (e.code === "ArrowUp") {
                setSpeed((prev) => (Math.max(prev - 50, 50)));
            } else if (e.code === "ArrowDown") {
                setSpeed((prev) => (Math.min(prev + 50, 500)));
            } else if (e.code === "KeyR") {
                setRunning(false)
                setGrid(populateGrid(rows, cols));
            } else if (e.code === "KeyC") {
                setRunning(false)
                setGrid(generateEmptyGrid(rows, cols));
            } else if (e.code === "KeyX") {
                setRunning(false)
                setGrid(randomizeGrid(rows, cols))
                setRunning(true)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        const handleResize = () => {
            setRunning(false)
            const { rows, cols } = getGridSize(window.innerWidth, window.innerHeight);
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

        const { rows, cols } = getGridSize(window.innerWidth, window.innerHeight);
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
            <canvas
                ref={canvasRef}
            />
        </div>
    );
}

export default App
