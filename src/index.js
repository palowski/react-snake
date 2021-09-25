import ReactDOM from 'react-dom';
import React, {useEffect, useReducer, useRef} from 'react';

const SPEED =       100 // ms
const GAME_SIZE = {
  Width:            20,
  Height:           20
}
const GAME_STATUS = {                   
  Running:          "RUNNING", 
  Killed:           "KILLED" 
} 
const ACTION = {                      
  TimeTick:         "TIME_TICK", 
  ChangeDirection:  "CHANGE_DIRECTION", 
  Start:            "START"
}
const DIRECTION = {                       // snake direction + keyCodes
  Left:             37, 
  Right:            39, 
  Up:               38, 
  Down:             40 
}
function getInitialState() {
  return {                  
    snake:      [ { x: Math.ceil(GAME_SIZE.Width / 2), y: Math.ceil(GAME_SIZE.Height / 2) }, ], 
    direction:  DIRECTION.Left,            
    snakeSize:  5,                         // initital snake size 
    status:     GAME_STATUS.Running,      
    food:       generateFoodPosition()      
  }
}

function generateFoodPosition() {      
  return { x: Math.floor(Math.random() * GAME_SIZE.Width), y: Math.floor(Math.random() * GAME_SIZE.Height)} 
}

function gameReducer(game, action) {   
  switch(action.type) { 
    case ACTION.Start:              return { ...getInitialState() }                        
    case ACTION.ChangeDirection:    return { ...game, direction: action.direction }  
    case ACTION.TimeTick: 
        let currentHead = game.snake[0]
        let nextHead = {x: currentHead.x, y: currentHead.y} 
        switch (game.direction) {
          case DIRECTION.Left:  nextHead.x = currentHead.x-1; if (nextHead.x<0)                  nextHead.x = GAME_SIZE.Width-1;  break;           
          case DIRECTION.Right: nextHead.x = currentHead.x+1; if (nextHead.x>GAME_SIZE.Width-1)  nextHead.x = 0;                  break;           
          case DIRECTION.Up:    nextHead.y = currentHead.y-1; if (nextHead.y<0)                  nextHead.y = GAME_SIZE.Height-1; break;           
          case DIRECTION.Down:  nextHead.y = currentHead.y+1; if (nextHead.y>GAME_SIZE.Height-1) nextHead.y = 0;                  break; default:  
        }
        if (game.snake.find( body => body.x === nextHead.x && body.y === nextHead.y) ) // check snake body collision
          return { ...game, status: GAME_STATUS.Killed }
        return {
          ...game, 
          snake: [nextHead, ...game.snake].splice(0, [nextHead, ...game.snake].length>game.snakeSize ? [nextHead, ...game.snake].length-1 : [nextHead, ...game.snake].length),
          food: (nextHead.x === game.food.x && nextHead.y === game.food.y) ? generateFoodPosition() : game.food, 
          snakeSize: (nextHead.x === game.food.x && nextHead.y === game.food.y) ? game.snakeSize++ : game.snakeSize 
        }                                                                       
    default: 
  }
}

function useInterval(callback, delay) {
  const savedCallback = useRef(callback)
  useEffect(() => { savedCallback.current = callback }, [callback])
  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

export default function Snake() {
  let [game, dispatch] = useReducer(gameReducer, getInitialState() )
  function handleChangeSnakeDirection(e) {
    if ( [DIRECTION.Left, DIRECTION.Right, DIRECTION.Up, DIRECTION.Down].includes(e.keyCode) ) {
      e.preventDefault(); 
      dispatch({type: ACTION.ChangeDirection, direction: e.keyCode}) }
  }
  useInterval(() => dispatch({type: ACTION.TimeTick}), game.status === GAME_STATUS.Running ? SPEED : null)  
  useEffect(() => { document.addEventListener('keydown', handleChangeSnakeDirection); return () => { document.removeEventListener('keydown', handleChangeSnakeDirection) } });  

  return (<div className="Game">
          React Snake. controls = LEFT, RIGHT, UP, DOWN
          { [...Array(GAME_SIZE.Height).keys()].map( y => {                   
              return <div style={{display: 'block', lineHeight: 0}}>{ 
                [...Array(GAME_SIZE.Width).keys()].map( x => {                
                  let color = '#eee'
                  if (x === game.food.x && y === game.food.y) 
                    color = 'green'
                  if (game.snake.find( p => p.x === x && p.y === y) )  
                    color = '#aaa'
                  return <div style={{ width:20, height:20, display: 'inline-block', backgroundColor: color,  border: '1px solid #ccc'}}/>})
              }</div>})} 
          { game.status === GAME_STATUS.Killed && (<button onClick={ () => dispatch({type:ACTION.Start})}>killed! try again</button>) }
          </div>); 
}
ReactDOM.render(<React.StrictMode><Snake /></React.StrictMode>, document.getElementById('root'));