import React from 'react'
import ReactDOM from 'react-dom'
import './bowling.css';

// Note: Was not able to complete doubles/turkeys or the 10th frame

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
                else if (i === 19 && currentScore[(i-1)] === 'X') i ++;
                else this.endGame();
            }
        }

        this.setState({
            score: currentScore,
            throwIndex: i,
            action: currentAction,
        }, () => this.evaluateScores());
    }

    hitPins(remainingPins) {
        return Math.floor(Math.random() * (remainingPins));
    }

    evaluateScores() {
        const i = this.state.throwIndex - 1;
        const currentScore = this.state.score;
        const currentFrame = Math.floor(i/2);
        let currentTotalScore = this.state.totalScore;
        let currentFrameScore = this.state.frameScore.map(Number);

        let pointsThisRoll = currentScore[i];
        console.log(pointsThisRoll);
        let pointsPrevRoll = currentScore[i-1];
        const strikeBonus = currentScore[i-3] === 'X';
        const spareBonus = pointsPrevRoll === '/';

        if (pointsPrevRoll === 'X') { // strike on first roll, using previous roll because strike adds index
            currentTotalScore += 10;
            currentFrameScore[currentFrame] += currentTotalScore;
        } else if (pointsThisRoll === '/') {
            currentTotalScore += (10 - pointsPrevRoll);
            currentFrameScore[currentFrame] += (10 - pointsPrevRoll);
        } else {
            if (!i) {
                currentTotalScore += pointsThisRoll;
                currentFrameScore[currentFrame] = pointsThisRoll;
            } else {
                if (strikeBonus) {
                    const frameScore = pointsThisRoll + pointsPrevRoll;
                    currentFrameScore[currentFrame-1] += frameScore;
                    currentTotalScore += pointsThisRoll;
                    currentFrameScore[currentFrame] = currentTotalScore + frameScore;
                    currentTotalScore = currentFrameScore[currentFrame];
                } else if (spareBonus) {
                    currentFrameScore[currentFrame-1] += pointsThisRoll;
                    currentTotalScore += pointsThisRoll;
                    currentFrameScore[currentFrame] = currentTotalScore + pointsThisRoll;
                    currentTotalScore = currentFrameScore[currentFrame];
                } else {
                    currentTotalScore += pointsThisRoll;
                    currentFrameScore[currentFrame] = currentTotalScore;
                }
            }
        }
        this.setState({
            frameScore: currentFrameScore,
            totalScore: currentTotalScore,
        })
    }

    // on 18 end game if not spare or strike
    // on 19 handle spares differently

    handleStrike(i, currentScore) {  // 18, 19, 20 handle strikes and spares differently
        currentScore[i] = 'X';
        if(i === 18 || i === 19) i++
        else if(i === 20) this.endGame();
        else i += 2
        this.setState({
            score: currentScore,
            throwIndex: i,
            action: 'Strike!',
        }, () => this.evaluateScores());
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
                                    return (<td
                                                id={i}
                                                className={this.state.throwIndex === i ? 'throwIndex' : undefined}
                                                key={i}>
                                                    {pins}
                                                </td>)
                                })}
                                <td id="total-score" className="align-middle" rowSpan="3">{this.state.totalScore}</td>
                            </tr>
                            <tr>
                                {this.state.frameScore.map((score, i) => {
                                    return (
                                        <td id={i} key={i} rowSpan={2} colSpan={i < 9 ? 2 : 3}>{score}</td>
                                    )
                                })}
                            </tr>
                        </tbody>
                    </table> 
                    <br/>
                    <h2>{this.state.action}</h2>
                    <br/>
                    <p>Note: Was not able to complete doubles/turkeys or the 10th frame</p>
                </div>
            </div>
        )
    }
}

