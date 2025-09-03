import {useCallback, useEffect, useState} from 'react'
import patterns from "./patterns.json"
import './App.css'

function App() {

    const ROWS = 50
    const COLS = 50

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
                setSpeed((prev) => (prev > 100 ? prev - 100 : 50));
            } else if (e.code === "ArrowDown") {
                setSpeed((prev) => (prev === 50 ? 100 : Math.min(prev + 100, 500)));
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


    return (
        <div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${COLS}, 10px)`,
                    marginTop: 20,
                }}
            >
                {grid.map((rows, i) =>
                    rows.map((col, j) => (
                        <div
                            key={`${i}-${j}`}
                            onClick={() => {
                                setRunning(false)
                                const newGrid = [...grid];
                                newGrid[i][j] = grid[i][j] ? 0 : 1;
                                setGrid(newGrid);
                            }}
                            style={{
                                width: 10,
                                height: 10,
                                backgroundColor: grid[i][j] ? "#ccc" : undefined,
                                border: "solid 0.5px #ccc",
                            }}
                        />
                    ))
                )}
            </div>
            <> {speed} </>
        </div>
    );
}

export default App
