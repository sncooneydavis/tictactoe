let game = manageGame();

function manageGame() {
    
    addTemplate('#headerTemplate', '#headerContainer', 'child');
    addTemplate('#endTemplate', '#endContainer', 'child');
    addTemplate('#boardTemplate', '#boardContainer', 'child');
    
    const bigBoard = makeBoard(0);

    for (let square in bigBoard.boardSquares) {
        document.querySelector(`#boardContainer > .${square}`).classList.add('main');
        addTemplate('#boardTemplate', `#boardContainer > .${square}`, 'grandchild');
        bigBoard.boardSquares[square] = makeBoard(square);
    }
    
    let activePlayer = (function() {
        let mark = 'x';
        function getMark() {
            return mark;
        };
        function getOtherMark() {
            return (mark == 'x' ? 'o' : 'x');
        }
        function switchPlayer() {
            mark = (mark == 'x' ? 'o' : 'x');
            document.querySelector('.player.x').classList.toggle('inactive', mark === 'o');
            document.querySelector('.player.o').classList.toggle('inactive', mark === 'x');
        };
        return {
            getMark,
            getOtherMark,
            switchPlayer,
        }
    })();

    let scores = (function() {
        let x = 0;
        let o = 0;
        function updateScore(player) {
            if (player === 'x') {
                x++;
                document.querySelector(`#player${player}Score`).value = x;
            } else if (player === 'o') {
                o++;
                document.querySelector(`#player${player}Score`).value = o;
            }
        }
        function getX() {
            return x;
        }
        function getO() {
            return o;
        }
        return {
            updateScore,
            getX,
            getO,
        }
    })();

    function showOutcome(mainGameOutcome) {
        const endScreenElement = document.getElementById('endContainer');
        endScreenElement.classList.remove('hidden');
        endScreenElement.querySelector('#restart').classList.remove('hidden');
        if (mainGameOutcome.outcome == 'win') {
            const mark = activePlayer.getMark();
            const winStreak = mainGameOutcome.sameMarksBoxNumbers;
            for (const boxNumber of winStreak) {
                document.querySelector(`#boardContainer > .${boxNumber} > .${mark}`).classList.add('won');
            }
            endScreenElement.querySelector(`.${mark}`).classList.remove('hidden');
        }
        else if (mainGameOutcome == 'tie') {
            
            const x = scores.getX();
            const o = scores.getO();
            if (x > o) {
                endScreenElement.querySelector('#end-x-wins').classList.remove('hidden');
            }
            else if (x < o) {
                endScreenElement.querySelector('#end-o-wins').classList.remove('hidden');
            }
            else if (x == o) {
                endScreenElement.querySelector('.tie').classList.remove('hidden');
            }
        }
        document.getElementById('restart').addEventListener('click', () => resetGame());
    };

    function resetGame() {
        document.querySelector('#boardContainer').classList.remove('inactive');
        document.querySelector('#headerContainer').innerHTML = '';
        document.querySelector('#boardContainer').innerHTML = '';
        document.querySelector('#endContainer').innerHTML = '';
        game = manageGame();
    }

    return {
        bigBoard,
        activePlayer,
        scores,
        showOutcome,
    }
}

function addTemplate(templatePosition, htmlPosition, type) {
    const template = document.querySelector(templatePosition);
    const clone = template.content.cloneNode(true);
    if (type == 'child') {
        document.querySelector(htmlPosition).appendChild(clone);
    }
    else if (type == 'grandchild') {
        const subBoardContainerFragment = document.createElement('div');
        subBoardContainerFragment.classList.add('subBoardContainer');
        const subBoardContainerElement = document.querySelector(htmlPosition).appendChild(subBoardContainerFragment);
        subBoardContainerElement.appendChild(clone);
    }
}
    
function makeBoard(id) {
    const boardID = id;

    //bigBoard's boardSquares originally holds subBoard
    //get's overwritten when subGame is won or tied 
    let boardSquares = {
        's1': undefined, 
        's2': undefined, 
        's3': undefined, 
        's4': undefined, 
        's5': undefined, 
        's6': undefined, 
        's7': undefined, 
        's8': undefined, 
        's9': undefined,
    }   

    let possibleWins = {
        topAcross: {
            combo: ['s1', 's2', 's3'],
            outcome: undefined,
        },
        midAcross: {
            combo: ['s4', 's5', 's6'],
            outcome: undefined,
        },
        bottomAcross: {
            combo: ['s7', 's8', 's9'],
            outcome: undefined,
        },
        leftDown: {
            combo: ['s1', 's4', 's7'],
            outcome: undefined,
        },
        midDown: {
            combo: ['s2', 's5', 's8'],
            outcome: undefined,
        },
        rightDown: {
            combo: ['s3', 's6', 's9'],
            outcome: undefined,
        },
        crossRight: {
            combo: ['s1', 's5', 's9'],
            outcome: undefined,
        },
        crossLeft: {
            combo: ['s3', 's5', 's7'],
            outcome: undefined,
        },
    }
    if (boardID != 0) {
        for (const subSquare in boardSquares) {
            const selectedSubSquare = document.querySelector(`.${boardID} .${subSquare}`);
            selectedSubSquare.classList.add('mini');
            const handler = function(event) {
                makeMoveHandler(event, subSquare, handler);
            };
            selectedSubSquare.addEventListener('click', handler);
        }
    }

    function makeMoveHandler(event, subSquare, handler) {
        event.target.querySelector(`.${game.activePlayer.getMark()}`).classList.remove("hidden"); 
        boardSquares[subSquare] = game.activePlayer.getMark();
        event.target.removeEventListener('click', handler);
        const subGameOutcome = checkPossibleWins(subSquare);
        if (subGameOutcome != "none") {
            for (const subSquare in boardSquares) {
                const selectedSubSquare = document.querySelector(`.${boardID} .${subSquare}`);
                selectedSubSquare.classList.remove('active');
                selectedSubSquare.classList.add('inactive');
                selectedSubSquare.removeEventListener('click', handler);
            }
            if (subGameOutcome.outcome == 'win') {
                game.scores.updateScore(game.activePlayer.getMark());
                game.bigBoard.boardSquares[boardID] = game.activePlayer.getMark();
                document.querySelector(`#boardContainer > .${boardID} > .${game.activePlayer.getMark()}`).classList.remove('hidden');
            }
            else {
                game.bigBoard.boardSquares[boardID] = 'tie';
            }
            const mainGameOutcome = game.bigBoard.checkPossibleWins(boardID);
            if (mainGameOutcome != 'none') {
                game.showOutcome(mainGameOutcome);
                document.querySelector('#boardContainer').classList.add('inactive');
            }    
        }
        makeBoardSquaresClickableOrUnclickable(subSquare);
        game.activePlayer.switchPlayer(); 
    }

    function makeBoardSquaresClickableOrUnclickable(squareToSelectFrom) {
        for (let square in game.bigBoard.boardSquares) {
                makeBoardSquaresUnclickable(square);
            }
        if (typeof game.bigBoard.boardSquares[squareToSelectFrom] != 'string') {
            makeBoardSquaresClickable(squareToSelectFrom);
        }
        else {
            for (let square in game.bigBoard.boardSquares) {
                if (typeof game.bigBoard.boardSquares[square] != 'string') {
                    makeBoardSquaresClickable(square);
                }
            }
        } 
        function makeBoardSquaresUnclickable(square) {
            for (let subSquare in game.bigBoard.boardSquares[square].boardSquares) {
                document.querySelector(`.${square} .${subSquare}`).classList.add('inactive');
                document.querySelector(`.${square} .${subSquare}`).classList.remove('active');
            } 
        }
        function makeBoardSquaresClickable(square) {
            for (let subSquare in game.bigBoard.boardSquares[square].boardSquares) {
                document.querySelector(`.${square} .${subSquare}`).classList.remove('inactive');
                document.querySelector(`.${square} .${subSquare}`).classList.add('active');
            }
        }
    }

    function checkPossibleWins(square) {
        // find matches in possible wins to the current square 
        let possibleWinsEliminated = 0;
        for (let possibility in possibleWins) {
            const currentPossibleWin = possibleWins[possibility];
            if (currentPossibleWin.outcome != undefined) {
                possibleWinsEliminated++;
            }
            else {
                for (const component of currentPossibleWin.combo) { 
                    if (component == square) {
                        // iterate through the possible win combo to see if current player won
                        let sameMarksInARow = 0;
                        let winObject = {
                            outcome: "win",
                            sameMarksBoxNumbers: [],
                        };
                        let mixedMarksInARow = 0;
                        for (const component of currentPossibleWin.combo) {
                            if (boardSquares[component] == game.activePlayer.getMark() ) {
                                sameMarksInARow++;
                                mixedMarksInARow++;
                                winObject.sameMarksBoxNumbers.push(component);
                            }

                            else if (boardSquares[component] == game.activePlayer.getOtherMark() ) {
                                mixedMarksInARow++;
                            }
                        }
                        if (sameMarksInARow == 3) {
                            currentPossibleWin.outcome = 'win';
                            return winObject;
                        }
                        else if (mixedMarksInARow == 3) {
                            currentPossibleWin.outcome = 'tie';
                            possibleWinsEliminated++;
                        }
                    }       
                }
            }           
        }
        if (possibleWinsEliminated == 8) {
            return 'tie';
        }
        else {
            return 'none'
        }  
    }
    return { boardID, boardSquares, makeMoveHandler, checkPossibleWins }
}

