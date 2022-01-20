import React from 'react'
import ReactDOM from 'react-dom'
import './bowling.css';

export default class Bowling extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            totalScore: 0,
            score: new Array(21).fill('-'),
            frameScore: new Array(10).fill('0'),
            throwIndex: 0,
            endGame: false,
            action: 'Good luck!',
            strikeCounter: 0,
        }
    }

    bowl = () => {
        let i = this.state.throwIndex;
        const secondShot = !(i % 2 === 0);
        let currentScore = this.state.score;
        let remainingPins = 11; // 11 for the RNG range
        let pins = 0
        let currentAction = '';

        if (secondShot || i > 18) { // if 2nd bowl calc remaining pins
            remainingPins = 11 - currentScore[(i-1)] ? 11 - currentScore[(i-1)] : 11;
        }
        pins = this.hitPins(remainingPins);
            for (var x = 0; x < 16; x++) {
                pins = 10;
            }

        if ((!i || !secondShot || i > 17) && pins === 10) {
            this.handleStrike(i, currentScore);
            return;
        } else {
            if (secondShot && pins + currentScore[(i-1)] === 10) {
                currentScore[i] = '/';
                currentAction = 'Spare!';
                if(i < 20) i++;
                else this.endGame();
            } else {
                currentScore[i] = pins;
                currentAction = pins ? 'Hit ' + pins + ' pins' : 'Gutter!';
                if (i < 19) i++;
                else if (i > 18 && i < 20 && (currentScore[(i-1)] === 'X' || currentScore[(i-1)] === '/')) i++;
                else { 
                    this.endGame(); 
                    i++; 
                } 
            }
        }

        this.setState({
            score: currentScore,
            throwIndex: i,
            action: currentAction,
        }, () => this.evaluateScores(currentScore));
    }

    hitPins(remainingPins) {
        return Math.floor(Math.random() * (remainingPins));
    }

    evaluateScores(score) {
        const i = this.state.throwIndex - 1;
        let currentFrame = Math.floor(i/2);
        if (currentFrame === 10) currentFrame--;
        const lastFrame = currentFrame === 9;
        let currentTotalScore = this.state.totalScore;
        let currentFrameScore = this.state.frameScore.map(Number);
        let strikes = this.state.strikeCounter;

        let pointsThisRoll = score[i];
        let pointsPrevRoll = score[i-1];
        const strikeBonus = score[i-3] === 'X';
        const spareBonus = pointsPrevRoll === '/' && ((i === 18) || !lastFrame); // not first throw of 10th frame

        if (pointsPrevRoll === 'X' && !lastFrame) { // using previous roll because strike adds index
            currentFrameScore[currentFrame] = null;
            if (strikes) {
                currentFrameScore[currentFrame-1] = null;
            } 
            if (strikes > 1) { // turkey
                currentFrameScore[currentFrame-2] = currentTotalScore + 30;
                currentTotalScore = currentFrameScore[currentFrame-2];
                currentFrameScore[currentFrame-1] = null;
                currentFrameScore[currentFrame] = null;
                strikes--;
            } 
            strikes++;
        } else if (pointsThisRoll === '/') { // if spare
            currentFrameScore[currentFrame] += (10 - pointsPrevRoll);
            currentTotalScore = currentFrameScore[currentFrame];
            if (strikes) { // spare after double
                currentFrameScore[currentFrame-1] = currentFrameScore[currentFrame-2] + 20
                currentFrameScore[currentFrame] = null;
            }
        } else {
            if (strikes && strikeBonus) { 
                if (pointsThisRoll === 'X') pointsThisRoll = 10;
                if (pointsPrevRoll === 'X') pointsPrevRoll = 10;
                let frameScore = pointsThisRoll + pointsPrevRoll;
                currentFrameScore[currentFrame-1] += (currentTotalScore + frameScore + 10);
                currentTotalScore = currentFrameScore[currentFrame-1] + frameScore;
                currentFrameScore[currentFrame] = currentTotalScore;
                strikes--;
            } else if (strikes > 1) { // doubles
                if (pointsThisRoll === 'X') pointsThisRoll = 10;
                if (pointsPrevRoll === 'X') pointsPrevRoll = 10;
                currentFrameScore[currentFrame-2] = currentTotalScore + 20 + pointsThisRoll;
                currentTotalScore = currentFrameScore[currentFrame-2];
                currentFrameScore[currentFrame-1] = null;
                currentFrameScore[currentFrame] = null;
                strikes--;
            } else if (spareBonus) { 
                if (strikes)  {
                    currentFrameScore[currentFrame-1] += currentFrameScore[currentFrame-2] + 10 + pointsThisRoll;
                    strikes--;
                }
                else currentFrameScore[currentFrame-1] += pointsThisRoll; // or strike?
                currentTotalScore = currentFrameScore[currentFrame-1];
                currentFrameScore[currentFrame] = currentTotalScore + pointsThisRoll;
                if (i === 20) currentFrameScore[currentFrame] = currentTotalScore; // last throw
                currentTotalScore = currentFrameScore[currentFrame];
            } else if (!strikes) {
                if (pointsThisRoll === 'X') pointsThisRoll = 10; // 10th frame
                if (pointsThisRoll === '/') pointsThisRoll = (10 - pointsPrevRoll); // 10th frame
                currentTotalScore += pointsThisRoll;
                currentFrameScore[currentFrame] = currentTotalScore;
            }
        }

        this.setState({
            frameScore: currentFrameScore,
            totalScore: currentTotalScore,
            strikeCounter: strikes,
        });


    }

    handleStrike(i, currentScore) {
        currentScore[i] = 'X';
        if(i === 18 || i === 19) i++
        else if(i === 20) this.endGame();
        else i += 2 // moving 2 indexes up to next frame
        this.setState({
            score: currentScore,
            throwIndex: i,
            action: 'Strike!',
        }, () => this.evaluateScores(currentScore));
    }

    endGame() {
        this.setState({
            endGame: true,
        });
    }

    playAgain = () => {
        const newGame = {
            totalScore: 0,
            score: new Array(21).fill('-'),
            frameScore: new Array(10).fill('0'),
            throwIndex: 0,
            endGame: false,
            action: 'Good luck!',
            strikeCounter: 0,
        }
        this.setState(newGame);
    }

    render() {
        return (
            <div className="container text-center">
                <div className="row">
                    <h1 className="display-4">Let's Bowl</h1>
                </div>

                <div className="text-center row justify-content-md-center">
                    <button
                        type="button"
                        className="btn btn-primary col-2"
                        disabled={this.state.endGame}
                        onClick={this.bowl}
                    >
                        Bowl
                        </button>
                    {this.state.endGame && 
                    <button
                        type="button"
                        className="btn btn-primary col-2"
                        onClick={this.playAgain}
                    >
                        Play Again?
                    </button>}
                </div>
                <br/>
                <div className="row">
                    <table className="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">Player</th>
                                <th scope="col" colSpan="2">1</th>
                                <th scope="col" colSpan="2">2</th>
                                <th scope="col" colSpan="2">3</th>
                                <th scope="col" colSpan="2">4</th>
                                <th scope="col" colSpan="2">5</th>
                                <th scope="col" colSpan="2">6</th>
                                <th scope="col" colSpan="2">7</th>
                                <th scope="col" colSpan="2">8</th>
                                <th scope="col" colSpan="2">9</th>
                                <th scope="col" colSpan="3">10</th>
                                <th scope="col">SCORE</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr> 
                                <th scope="row" className="align-middle" rowSpan="2">You</th>
                                {this.state.score.map((pins, i) => {
                                    while (i < 21) {
                                        return (<td
                                            id={i}
                                            className={this.state.throwIndex === i ? 'currentThrow' : undefined}
                                            key={i}>
                                                {pins}
                                            </td>)
                                    }
                                })}
                                <td id="total-score" className="align-middle" rowSpan="3">{this.state.totalScore}</td>
                            </tr>
                            <tr>
                                {this.state.frameScore.map((score, i) => {
                                    while (i < 10) {
                                        return (
                                            <td id={i} key={i} rowSpan={2} colSpan={i < 9 ? 2 : 3}>{score}</td>
                                        )
                                    }
                                })}
                            </tr>
                        </tbody>
                    </table> 
                    <br/>
                    <h2>{this.state.action}</h2>
                    <br/>
                    <div className='container'>
                        <h4>Nice to haves</h4>
                        <p>Multiple players, Name input, Editable scores, Score input</p>
                    </div>
                </div>
            </div>
        )
    }
}


// Add in Bowling.jsx below ln 30 where pins are set for testing
// if (i === 0) pins = 10;
// if (i === 1) pins = 1;
// if (i === 2) pins = 10;
// if (i === 3) pins = 1;
// if (i === 4) pins = 1;
// if (i === 5) pins = 5;
// if (i === 6) pins = 5;
// if (i === 7) pins = 1;
// if (i === 8) pins = 1;
// if (i === 9) pins = 1;
// if (i === 10) pins = 1;
// for (var x = 0; x < 16; x++) {
//     pins = 1;
// }
