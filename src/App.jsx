import {useCallback, useEffect, useRef, useState} from 'react'
import patterns from "./patterns.json"
import './App.css'

function App() {

    const ROWS = 100
    const COLS = 100
    const CELL_SIZE = 10

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ]

    const generateEmptyGrid = () => {
        return Array.from({length: ROWS}, () => Array(COLS).fill(0))
    }

    const populateGrid = useCallback(() => {
        const patternKeys = Object.keys(patterns)
        const patternName = patternKeys[Math.floor(Math.random() * patternKeys.length)]

        console.log(patternName)

        const pattern = patterns[patternName]
        const newGrid = generateEmptyGrid()

        const centerR = Math.floor(ROWS / 2)
        const centerC = Math.floor(COLS / 2)

        pattern.forEach(([dr, dc]) => {
            const rr = centerR + dr
            const cc = centerC + dc
            if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
                newGrid[rr][cc] = 1;
            }
        });

        return newGrid
    }, [])

    const [grid, setGrid] = useState(populateGrid)
    const [running, setRunning] = useState(false)
    const [speed, setSpeed] = useState(100)
    const canvasRef = useRef(null)

    const generateNextGrid = useCallback((g) => {
        return g.map((row, r) =>
            row.map((cell, c) => {
                let neighbours = 0;
                directions.forEach(([x, y]) => {
                    const dx = r + x
                    const dy = c + y
                    if (0 <= dx && dx < ROWS && 0 <= dy && dy < COLS) {
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
            setGrid((g) => generateNextGrid(g))
        }, speed);

        return () => clearInterval(interval)
    }, [running, speed])

    useEffect(() => {
        setRunning(true)
    },[])

    useEffect(() => {
        const handleKeyDown = (e) => {
            e.preventDefault()
            if (e.code === "Space") {
                toggleSimulation();
            } else if (e.code === "ArrowUp") {
                setSpeed((prev) => (Math.max(prev - 50, 50)));
            } else if (e.code === "ArrowDown") {
                setSpeed((prev) => (Math.min(prev + 50, 500)));
            } else if (e.code === "KeyR") {
                setRunning(false)
                setGrid(populateGrid())
            } else if (e.code === "KeyC") {
                setRunning(false)
                setGrid(generateEmptyGrid())
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return;
        const ctx = canvas.getContext('2d')

        canvas.width = COLS * CELL_SIZE
        canvas.height = ROWS * CELL_SIZE

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        grid.forEach((row, r) =>
            row.forEach((cell, c) => {
                if (cell) {
                    ctx.fillStyle = "#ccc"
                    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
                ctx.strokeStyle = "#333";
                ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            })
        );
    }, [grid])


    return (
        <div style={{textAlign: "center"}}>
            <canvas
                ref={canvasRef}
                width={COLS * CELL_SIZE}
                height={ROWS * CELL_SIZE}
                style={{marginTop: 20,}}
            />
            <div style={{marginTop: 10}}>Speed: {speed}ms</div>
        </div>
    );
}

export default App
