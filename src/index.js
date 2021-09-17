import ReactDOM from 'react-dom';
import React, {useEffect, useReducer} from 'react';

// interval v ms mezi pohybem hada
const SPEED =       100 // ms
// velikost hraci plochy
const GAME_SIZE = { 
  Width:            20,
  Height:           20
}
// stav hry
const GAME_STATE = { 
  Running:          "RUNNING", 
  Killed:           "KILLED" 
} 
// herni udalosti
const ACTION = {
  Move:             "MOVE", 
  ChangeDirection:  "CHANGE_DIRECTION", 
  Start:            "START"
}
// smer pohybu hada / ovladani sipkami
const DIRECTION = { 
  Left:             37, 
  Right:            39, 
  Up:               38, 
  Down:             40 
}
// vychozi stav hry
// vse, podle ceho se vykreslovani na obrazovku a chovani hry ridi, je ulozeno ve stavu
const initialState = { 
  snake: [ {                              // jednotlive kousky hada ulozim do pole
    x: Math.ceil(GAME_SIZE.Width / 2), 
    y: Math.ceil(GAME_SIZE.Height / 2) }, 
  ], 
  direction: DIRECTION.Left,              // smer pohybu hada
  snakeSize: 5,                           // vychozi delka hada, na kterou had po startu doroste
  canChangeDirection: true, 
  gameState: GAME_STATE.Running,          // po startu hned spustit hru 
  food: generateFoodPosition()            // pozice 1.jidla
}
// vygeneruje nahodnou pozici jidla
function generateFoodPosition() { 
  return {
    x: Math.floor(Math.random() * GAME_SIZE.Width), 
    y: Math.floor(Math.random() * GAME_SIZE.Height)} 
}
// zmenu stavu hry resim pres reducer
function gameReducer(state, action) {
  switch(action.type) { 
    // na zacatku hry
    case ACTION.Start:              return {...initialState}                                                                             
    // nastavi smer pohybu a zabrani zmene smeru do provedeni pohybu
    case ACTION.ChangeDirection:    return {...state, direction: action.direction, canChangeDirection: false}
    case ACTION.Move: 
        // pokud hra bezi, provede pohyb hada
        if (state.gameState === GAME_STATE.Running) {
          let currentHead = state.snake[0]
          let nextHead = {x:currentHead.x, y:currentHead.y} 
          // obsluha pohybu konkretnim smerem
          switch (state.direction) {
            case DIRECTION.Left:  nextHead.x = currentHead.x-1; if (nextHead.x<0)                  nextHead.x = GAME_SIZE.Width-1;  break;              // vlevo + pri preteceni objeveni se vpravo
            case DIRECTION.Right: nextHead.x = currentHead.x+1; if (nextHead.x>GAME_SIZE.Width-1)  nextHead.x = 0;                  break;              // vpravo + pri preteceni objeveni se vlevo
            case DIRECTION.Up:    nextHead.y = currentHead.y-1; if (nextHead.y<0)                  nextHead.y = GAME_SIZE.Height-1; break;              // nahoru + pri preteceni objeveni se dole
            case DIRECTION.Down:  nextHead.y = currentHead.y+1; if (nextHead.y>GAME_SIZE.Height-1) nextHead.y = 0;                  break; default:     // dolu + pri preteceni objeveni se nahore
          }
          // detekce kolize hlavy hada s telem hada
          if (state.snake.find( body => body.x === nextHead.x && body.y === nextHead.y) ) 
            return { ...state, gameState: GAME_STATE.Killed }
          // novy herni stav
          return {
            ...state, 
            // pridani nove hlavy, smazani ocasu
            // lidske vysvetleni kodu:         delka pridane hlavy + tela je vetsi nez vychozi delka hada ? ANO=pridej hlavu a smaz ocas        : NE=jen pridej hlavu (had jeste roste do min.delky) 
            snake: [nextHead, ...state.snake].splice(0, [nextHead, ...state.snake].length>state.snakeSize ? [nextHead, ...state.snake].length-1 : [nextHead, ...state.snake].length),
            // sezrani jidla
            food: (nextHead.x === state.food.x && nextHead.y === state.food.y) ? generateFoodPosition() : state.food, 
            // po provedeni pohybu hada je mozno zmenit smer pohybu
            canChangeDirection: true,
            // postupne narustani delky hada na vychozi velikost
            snakeSize: (nextHead.x === state.food.x && nextHead.y === state.food.y) ? state.snakeSize++ : state.snakeSize 
          }                                                                       
        } 
        return state; 
    default: 
  }
}

export default function Snake() {
  let [state, dispatch] = useReducer(gameReducer, initialState)
  function handleChangeSnakeDirection(e) {
    // pouze kdyz je zmacnuta sipka... a pocita se pouze 1.stisk sipky!
    if (state.canChangeDirection && [DIRECTION.Left, DIRECTION.Right, DIRECTION.Up, DIRECTION.Down].includes(e.keyCode) ) {
      // potlaci default akci prohlizece 
      e.preventDefault(); 
      // nastavi novy smer pohybu
      dispatch({type: ACTION.ChangeDirection, direction: e.keyCode}) }
  }
  useEffect(() => {
    document.addEventListener('keydown', handleChangeSnakeDirection); 
    let interval = setTimeout( () => { dispatch({type: ACTION.Move}) }, SPEED);     // v pravidelnem intervalu naplanuj pohyb hada
    return () => { clearTimeout(interval); document.removeEventListener('keydown', handleChangeSnakeDirection); }                                     // opusteni stranky
  });  
  return (<div className="Game">
          {[...Array(GAME_SIZE.Height).keys()].map( y => {                                                                                      // radky hraci plochy
          return <div style={{display: 'block', lineHeight: 0}}>{                                                                         // obal radku
            [...Array(GAME_SIZE.Width).keys()].map( x => {                                                                                      // sloupecek v kazdem z radku
              if (x === state.food.x && y === state.food.y)             return <div style={{ width:10, height:10, display: 'inline-block', backgroundColor: 'green', border: '1px solid #ccc'}}/>   // jidlo
              else if (state.snake.find( p => p.x === x && p.y === y) ) return <div style={{ width:10, height:10, display: 'inline-block', backgroundColor: '#aaa',  border: '1px solid #ccc'}}/>   // telo hada
              else                                                      return <div style={{ width:10, height:10, display: 'inline-block', backgroundColor: '#eee',  border: '1px solid #ccc'}}/>}) // prazdna plocha
                }</div>})} 
          {state.gameState === GAME_STATE.Killed && (<button onClick={ () => dispatch({type:ACTION.Start})}>killed! try again</button>)}</div>); // pokud je had mrtev, zobraz tl.pro restart hry
}
ReactDOM.render(<React.StrictMode><Snake /></React.StrictMode>, document.getElementById('root'));


