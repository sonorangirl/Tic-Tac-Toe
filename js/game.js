//// Tic Tac Toe ////
var aiPlayer = 'O';
var player1 = 'X';
var turn = 'human';
var difficulty = 'easy';
var movesCounter = 0;
var availableMoves = [1,2,3,4,5,6,7,8,9];
var userMoves = [];
var aiMoves = [];
var aiWins = 0;
var userWins = 0;


$(document).ready( function() {

//Shows bootstrap alerts
function showAlert(message,alerttype) {
    $('#alert_placeholder').append('<div id="alertdiv" class="alert ' +  alerttype + '"><a class="close" data-dismiss="alert">×</a><span>'+message+'</span></div>');
    // automatically close the alert if the player1 doesnt close it in 5 secs
    setTimeout(function() {
      $("#alertdiv").remove();
    }, 5000);
}

//Changes difficulty level
$('#difficultyLevel').click(function() {
	if (movesCounter <= 1) { //don't let users change difficulty mid-game
		if (difficulty === 'easy') {
			difficulty = 'medium';
			$('#difficultyLevel').text('Difficulty: Medium');
		} else if (difficulty === 'medium') {
			difficulty = 'hard';
			$('#difficultyLevel').text('Difficulty: Hard');
		} else if (difficulty === 'hard') {
			difficulty = 'easy';
			$('#difficultyLevel').text('Difficulty: Easy');
		}
	}
	
});

//Allows user to reset the game
$('#resetGame').click(function() {
	// Sweet Alert to ask if player wants to delete their scores
	sweetAlert({
		title: 'Are you sure?',
		text: 'This will reset your scores to zero.',
		type: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#6BE2F9',
		confirmButtonText: 'Yes',
		cancelButtonText: 'No',
		closeOnConfirm: true,
		closeOnCancel: true,
		customClass: 'sweetAlert'
	}, function(confirmed) {
		if (confirmed) {
			aiWins = 0;
			userWins = 0;
			resetGameBoard();
		}
	});
});

//Determines who goes first
function whosOnFirst() {
	var determineFirst = Math.random();
	if (determineFirst < 0.50) {
		turn = 'human';
		showAlert('You\'re up first!', 'alert-info');
	} else {
		turn = 'computer';
	}
	console.log('The ' + turn + ' is up first');
}

//Changes whos turn it is
function changeTurn() {
	movesCounter++;
	if (turn === 'computer') {
		turn = 'human';
	} else {
		turn = 'computer';
	}
	placeMove();
}

//If game is won, alerts who has won, updates scores, and resets the board
function alertWin(player) {
	var heading = "";
	var kindOfAlert;

	if (player === player1) {
		userWins++;
		$('#userScore').text('player wins: ' + userWins);
		heading = 'You\'ve won the game!';
		kindOfAlert = 'success';
	} else {
		aiWins++;
		$('#aiScore').text('computer wins: ' + aiWins);
		heading = 'The computer wins :(';
		kindOfAlert = 'error';
	}
				
	sweetAlert({
		title: heading,
		text: 'Do you want to play again?',
		type: kindOfAlert,
		showCancelButton: true,
		confirmButtonColor: '#6BE2F9',
		confirmButtonText: 'Yes',
		cancelButtonText: 'No',
		closeOnConfirm: false,
		closeOnCancel: false,
		customClass: 'sweetAlert'
	}, function(playAgain) {
		if (playAgain) {
			resetGameBoard();
			startGame();
		} else {
			sweetAlert({
				title: 'Bye!',
				text: 'Thanks for playing!',
				allowEscapeKey: true,
				allowOutsideClick: true
			});
		}
	});
}

//Checks for a Win
function checkWin(playerArr, player) {
	var gameWon = false;

	var winningCombos = [
		[1,2,3],
		[4,5,6],
		[7,8,9],
		[1,4,7],
		[2,5,8],
		[3,6,9],
		[1,5,9],
		[3,5,7]
	];

	//function to compare players Moves arrays to winning arrays, 
	//returns true if any combination matches a winning array, false if not
	function checkCombos() {
		gameWon = winningCombos[i].every(function (val) {
			return playerArr.indexOf(val) >= 0;
		});
	}

	//check each winning combo against players Moves array
	for (var i = 0; i < winningCombos.length; i++) {
		checkCombos();
		//If gameWon is found true, alert win
		if (gameWon) {
			console.log('Game Won');
			if (player === player1) {
				return alertWin(player1);
			} else {
				return alertWin(aiPlayer);
			}
		}
	}
	//If game not won, change turn
	changeTurn();
}

//Adds a move to the board, then updates player and availability arrays
function makeMove(boxNum, player, playerArr) {
	var boxNumtoString = boxNum.toString();

	//Add move to the board
	$('#box-' + boxNumtoString + ' p').addClass('player-' + player).text(player);

	//remove from available moves
	var elemToRemove = availableMoves.indexOf(boxNum);
	availableMoves.splice(elemToRemove, 1);

	//add move to players array
	playerArr.push(boxNum);

	//Check for win after each move
	checkWin(playerArr, player);
}

//Gets the users move
function userMove() {
	$('.board div').click( function() {
		var playerMove = this.id;
		playerMove = (playerMove.split("").pop()) * 1;

		//if move is found in availble moves array, it can be played
		if (availableMoves.indexOf(playerMove) >= 0) {
			makeMove(playerMove, player1, userMoves);
		}
	});
}

//For easy difficulty, function to randomly choose computer move
function randomMove() {
	var randomNum = (Math.floor(Math.random()*9) + 1);
	
	//check if move is available then add move to board
	if (availableMoves.indexOf(randomNum) >= 0) {
		makeMove(randomNum, aiPlayer, aiMoves);
	
	} else {
		randomMove();
	}
}

//** AI Logic **//
//Determine if the computer has any two boxes filled within a row,
//Or if player1 has any two boxes filled within a row
//then add a computer move to complete/disrupt the row.
function determineAIMove() {
	var winningMove = false;

	var potentialWins = [
		[[2,3],[5,9],[4,7]],		// box1
		[[1,3],[5,8]],				// box2
		[[1,2],[5,7],[6,9]],		// box3
		[[1,7],[5,6]],				// box4
		[[1,9],[2,8],[3,7],[4,6]],	// box5
		[[4,5],[3,9]],				// box6
		[[1,4],[3,5],[8,9]],		// box7
		[[2,5],[7,9]],				// box8
		[[3,6],[1,5],[7,8]]			// box9
	];

	function checkPotentialWins(playerArr) {
		var subArray;

		//Checks if all values from a sub array are found in the player Arr being compared to
		function checkSubArrays() {
			winningMove = subArray.every(function(val) {
				return playerArr.indexOf(val) >= 0;
			});
		}

		//Iterate through the potentialWins array,
		for (var i = 0; i < potentialWins.length; i++) {
			var moveChoice = i + 1;

			//check if choice is available on board
			if (availableMoves.indexOf(moveChoice) >= 0) {

				//Loop through the potentialWin values for each choice
				for (var j = 0; j < potentialWins[i].length; j++) {
					subArray = potentialWins[i][j];

					//Then check if all values from a sub array are found in the player Arr being checked
					checkSubArrays();
					
					//if a subarray is found to have a potential win or block, place move using that choice
					if (winningMove) {
						makeMove(moveChoice, aiPlayer, aiMoves);
						return;
					}
				}
			}
		}
	}

	//check for ai win moves
	console.log('checking for winning moves');
	checkPotentialWins(aiMoves);
	//if none found, check for moves to prevent user win
	if (!winningMove) {
		console.log('checking for blocking moves');
		checkPotentialWins(userMoves);
		//if neither found, make random move
		if (!winningMove) {
			console.log('making a random move');
			randomMove();
		}
	}
}

function makeAIMove() {
	if (movesCounter >= 3) {
		determineAIMove();
		
	} else {
		var cornersAndMiddle = [5,1,3,7,9];
		
		cornersAndMiddle.some(function(val) {
			//check availability of box
			if (availableMoves.indexOf(val) >= 0) {
				makeMove(val, aiPlayer, aiMoves);
				//stop rest of array being checked
				return true;
			}
		});
	}
}

//Places moves on the board
function placeMove() {
	console.log('Moves counter is ' + movesCounter);
	if (movesCounter < 9) {

		if (turn === 'human') {
			userMove();
		} else {
			//computer's turn
			if (difficulty === 'easy') {
				setTimeout(randomMove, 1000);
			} else if (difficulty === 'medium') {
				if (movesCounter < 3) {
					setTimeout(randomMove, 1000);
				} else {
					setTimeout(makeAIMove, 1000);
				}
			} else if (difficulty === 'hard') {
				setTimeout(makeAIMove, 1000);
			}
		}

	//Else game is a draw and reset the game
	} else {
		sweetAlert({
			title: 'It\'s a draw.',
			text: 'Do you want to play again?',
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#6BE2F9',
			confirmButtonText: 'Yes',
			cancelButtonText: 'No',
			closeOnConfirm: false,
			closeOnCancel: false,
			customClass: 'sweetAlert'
		}, function(playAgain) {
			if (playAgain) {
				resetGameBoard();
				startGame();
			} else {
				sweetAlert({
					title: 'Bye!',
					text: 'Thanks for playing!',
					confirmButtonColor: '#6BE2F9',
					customClass: 'sweetAlert',
					closeOnConfirm: true,
					allowEscapeKey: true,
					allowOutsideClick: true
				});
			}
		});
	}
}

//Resets the Game Board
function resetGameBoard() {
	console.log('reset happening');
	movesCounter = 0;
	availableMoves = [1,2,3,4,5,6,7,8,9];
	userMoves = [];
	aiMoves = [];
	for (var i = 1; i < 10; i++) {
		$('#box-' + i + ' p').removeClass('player-O').removeClass('player-X').empty();
	}
}

//starts a new game
function startGame() {
	// Sweet Alert to determine player characters
    sweetAlert({
		title: 'Let\'s Play!',
		text: 'Would you like to be X or O?',
		type: 'info',
		showCancelButton: true,
		confirmButtonColor: '#6BE2F9',
		confirmButtonText: 'X',
		cancelButtonText: 'O',
		closeOnConfirm: true,
		closeOnCancel: true,
		customClass: 'sweetAlert'
	}, function(pickedX) {
		if (pickedX) {
			player1 = 'X';
		} else {
			player1 = 'O';
		}
	
		if (player1 == 'X') {
			aiPlayer = 'O';
		} else {
			aiPlayer = 'X';
		}
		console.log(player1, aiPlayer);
		console.log('Difficulty Level is ' + difficulty);
		
		//Decide who goes first
		whosOnFirst();

		//Make the first move
		placeMove();
	});
}

startGame();


}); //end document.ready











