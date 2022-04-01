import React from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"
import "./style.css"

export default function App() {

    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState({value: false, count: 0})
    const [timerOn, setTimerOn] = React.useState(false)
    const [stats, setStats] = React.useState({rolls: 0, time: 0})
    const [statHistory, setStatHistory] = React.useState(() => JSON.parse(localStorage.getItem("stats")) || [] )
    const [highscore, setHighscore] = React.useState({rolls: Infinity, time: Infinity})
    const [darkmode, setDarkmode] = React.useState(false)
    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(oldTenzies => ({...oldTenzies, value: true, count: oldTenzies.count + 1}))
            setTimerOn(false)
            setStatHistory(oldStatHistory => [stats, ...oldStatHistory])
        }
    }, [dice])

    React.useEffect(() => {
        localStorage.setItem("stats",JSON.stringify( statHistory))  
    },[tenzies])

    React.useEffect(() =>{  
        let highscoreRolls = leastRolls()
        let highscoreTime = bestTime()
        setHighscore({rolls: highscoreRolls, time: highscoreTime })
    },[statHistory.length])
    console.log(highscore.rolls,highscore.time)
    React.useEffect (() => {
      let interval = null;
      if(timerOn){
        interval = setInterval(() => {
            setStats(prevStats => ({...prevStats, time: prevStats.time + 10}))
        }, 10)
      } else {
        clearInterval(interval)
      }
       return () => clearInterval(interval)
    }, [timerOn])
    
    function leastRolls(){
        let compare = Infinity
        for (let stat of statHistory){
            if(stat.rolls < compare){
                compare = stat.rolls
            }
        }
        return compare
    }

    function bestTime(){
        let compare = Infinity
        for (let stat of statHistory){
            if(stat.time < compare){
                compare = stat.time
            }
        }
        return compare
    }
    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        if (!tenzies.value && !timerOn ){
            setTimerOn(true)
            setStats({rolls: 0, time: 0})
        }
        else if(!tenzies.value) {
            setStats(oldStats => ({...oldStats, rolls: oldStats.rolls + 1}))
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
        } else {
            setTenzies(oldTenzies => ({...oldTenzies, value: false}))
            setDice(allNewDice())
            setTimerOn(true)
            setStats({rolls: 0, time: 0})
        }
        
    }
    
    function holdDice(id) {
        if(timerOn){
            setDice(oldDice => oldDice.map(die => {
                return die.id === id ? 
                    {...die, isHeld: !die.isHeld} :
                    die
            
            }))
        }
    }
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))

    function toggleDarkMode() {
        setDarkmode(prevValue => !prevValue)
    }
    
    return (
        <main>
            {tenzies.value && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            
            <div className="dice-container">
                {diceElements}
            </div>

            <div className="stats">
                {(statHistory.length>0)&&
                <div className="stats--1">
                    <h2>Best Time: </h2>
                    <span>{("0" + Math.floor((highscore.time/60000) % 60)).slice(-2)}:</span>
                    <span>{("0" + Math.floor((highscore.time/1000) % 60)).slice(-2)}:</span>
                    <span>{("0" + ((highscore.time/10) % 100)).slice(-2)}</span>
                </div>}
                <div className="stats--1">
                    <h2>Time: </h2>
                        <span>{("0" + Math.floor((stats.time/60000) % 60)).slice(-2)}:</span>
                        <span>{("0" + Math.floor((stats.time/1000) % 60)).slice(-2)}:</span>
                        <span>{("0" + ((stats.time/10) % 100)).slice(-2)}</span> 
                </div>
                <div className="stats--1">
                    <h2>Rolls:</h2>
                    {stats.rolls}
                </div>
                {(statHistory.length>0)&&
                <div className="stats--1">
                    <h2>Least Rolls:</h2> 
                    {highscore.rolls}
                </div>}
            </div>



            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {(tenzies.value || !timerOn) ? "New Game" : "Roll"}
            </button>
        </main>
    )
}