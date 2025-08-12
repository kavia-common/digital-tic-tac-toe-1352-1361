import React, { useMemo, useState } from 'react';
import './App.css';

/**
 * Calculates the winner for a 3x3 Tic Tac Toe board.
 * @param {Array<string|null>} squares - The 9 cells, each 'X', 'O', or null.
 * @returns {{winner: 'X'|'O', line: number[]} | null} Winner info with winning line indices or null if none.
 */
function calculateWinner(squares) {
  const lines = [
    // Rows
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    // Cols
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    // Diags
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

/**
 * A single clickable square in the grid.
 * @param {{value: string|null, onClick: () => void, index: number, highlight: boolean}} props
 */
function Square({ value, onClick, index, highlight }) {
  return (
    <button
      type="button"
      className={`square ${highlight ? 'square--highlight' : ''}`}
      onClick={onClick}
      aria-label={`Cell ${index + 1}${value ? `, ${value}` : ''}`}
      aria-pressed={!!value}
    >
      {value}
    </button>
  );
}

/**
 * The 3x3 game board.
 * @param {{squares: Array<string|null>, onSquareClick: (index:number)=>void, winningLine: number[] | null}} props
 */
function Board({ squares, onSquareClick, winningLine }) {
  const renderSquare = (i) => {
    const isWinning = winningLine ? winningLine.includes(i) : false;
    return (
      <Square
        key={i}
        index={i}
        value={squares[i]}
        highlight={isWinning}
        onClick={() => onSquareClick(i)}
      />
    );
  };

  return (
    <div className="grid" role="grid" aria-label="Tic Tac Toe grid">
      {[0, 1, 2].map((row) => (
        <div className="grid-row" role="row" key={row}>
          {[0, 1, 2].map((col) => {
            const idx = row * 3 + col;
            return (
              <div className="grid-cell" role="gridcell" key={idx}>
                {renderSquare(idx)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Move history list with jump-to-move controls.
 * @param {{history: Array<{squares:Array<string|null>, lastMove:number|null}>, currentStep: number, onJumpTo: (step:number)=>void}} props
 */
function MoveHistory({ history, currentStep, onJumpTo }) {
  const moveToText = (step, lastMove) => {
    if (step === 0) return 'Go to game start';
    // Derive row/col for display (1-based)
    if (typeof lastMove === 'number') {
      const row = Math.floor(lastMove / 3) + 1;
      const col = (lastMove % 3) + 1;
      return `Go to move #${step} (r${row}, c${col})`;
    }
    return `Go to move #${step}`;
    // If lastMove is null (edge-case), fallback to basic text.
  };

  return (
    <div className="panel">
      <h3 className="panel-title">Move History</h3>
      <ol className="history-list">
        {history.map((stepState, step) => (
          <li key={step}>
            <button
              type="button"
              className={`btn btn--ghost ${currentStep === step ? 'btn--active' : ''}`}
              onClick={() => onJumpTo(step)}
              aria-current={currentStep === step ? 'step' : undefined}
            >
              {moveToText(step, stepState.lastMove)}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * App: Tic Tac Toe game UI and logic.
 * - Minimalistic, light-themed UI using colors: primary (#1976d2), secondary (#424242), accent (#ffca28).
 * - Features: two-player mode, centered 3x3 grid, status display (win/draw/ongoing), restart button, move history.
 * @returns {JSX.Element} The root application component.
 */
function App() {
  // Game history: each step holds the board state and index of the last move
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), lastMove: null },
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  const current = history[currentStep];
  const xIsNext = currentStep % 2 === 0;

  const winnerInfo = useMemo(() => calculateWinner(current.squares), [current.squares]);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winningLine = winnerInfo ? winnerInfo.line : null;

  const isDraw = !winner && current.squares.every((s) => s !== null);

  /**
   * Handles a user click on a square.
   * @param {number} index - Index of the square clicked.
   */
  function handleSquareClick(index) {
    // Ignore click if game over or cell taken
    if (winner || current.squares[index]) return;

    const nextSquares = current.squares.slice();
    nextSquares[index] = xIsNext ? 'X' : 'O';

    // Discard any "future" moves if time-traveled
    const truncatedHistory = history.slice(0, currentStep + 1);
    setHistory(truncatedHistory.concat([{ squares: nextSquares, lastMove: index }]));
    setCurrentStep(truncatedHistory.length);
  }

  /**
   * Jump to a specific historical move.
   * @param {number} step - The step index to jump to.
   */
  function jumpTo(step) {
    setCurrentStep(step);
  }

  /**
   * Reset to a new game.
   */
  function restart() {
    setHistory([{ squares: Array(9).fill(null), lastMove: null }]);
    setCurrentStep(0);
  }

  let statusText = '';
  if (winner) {
    statusText = `Winner: ${winner}`;
  } else if (isDraw) {
    statusText = 'Draw! No moves left.';
  } else {
    statusText = `Next Player: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Tic Tac Toe</h1>
        </header>

        <div className="status-bar" role="status" aria-live="polite">
          <span className={`status ${winner ? 'status--win' : isDraw ? 'status--draw' : 'status--ongoing'}`}>
            {statusText}
          </span>
        </div>

        <main className="main">
          <Board
            squares={current.squares}
            winningLine={winningLine}
            onSquareClick={handleSquareClick}
          />
        </main>

        <section className="controls">
          <button
            type="button"
            className="btn"
            onClick={restart}
            aria-label="Restart game"
          >
            Restart
          </button>
        </section>

        <footer className="footer">
          <MoveHistory
            history={history}
            currentStep={currentStep}
            onJumpTo={jumpTo}
          />
        </footer>
      </div>
    </div>
  );
}

export default App;
