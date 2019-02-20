/*
* This is a BlackJack player that allows for easy plugging of 
* user-provided AI to attempt algorithmic basic strategy and card
* counting techniques in code. 
*
* This code was written and designed for use by Fountain Valley High School
* AP CS Principles students. Code layout and design is such that it falls in
* line (as much as possible) with the subset of JavaScript that the students
* have learned throughout the course of the year.
*/

// This will determine who is playing at the table
// Change this to insert your name and playing function
var PLAYERS = {
    "alwaysHit": alwaysHit,
    "alwaysStand": alwaysStand,
    "HitUntil17": hitUntil17,
};

// The number of hands to play
var NUMBER_OF_HANDS = 10000;

var NUMBER_OF_DECKS = 5; // Configure this if you wish
var SHUFFLE_THRESHOLD = 52; // the number of cards required to play the next hand without shuffling new cards

// varants for actions
var STAND = 0;
var HIT = 1;

// varants for different cards
var ACE = 1; // remember that Ace can either be 11 or 1!
var TWO = 2;
var THREE = 3;
var FOUR = 4;
var FIVE = 5;
var SIX = 6;
var SEVEN = 7;
var EIGHT = 8;
var NINE = 9;
var TEN = 10;
var JACK = 11;
var QUEEN = 12;
var KING = 13;

// Creates a deck of cards, as an array
function deckOfCards() {
    return [
        ACE, ACE, ACE, ACE,
        TWO, TWO, TWO, TWO, 
        THREE, THREE, THREE, THREE, 
        FOUR, FOUR, FOUR, FOUR,
        FIVE, FIVE, FIVE, FIVE, 
        SIX, SIX, SIX, SIX, 
        SEVEN, SEVEN, SEVEN, SEVEN, 
        EIGHT, EIGHT, EIGHT, EIGHT, 
        NINE, NINE, NINE, NINE, 
        TEN, TEN, TEN, TEN, 
        JACK, JACK, JACK, JACK, 
        QUEEN, QUEEN, QUEEN, QUEEN, 
        KING, KING, KING, KING
    ]
}

function cardToString(card) {
    if (card === ACE) {
        return "A"
    } else if (card === JACK) {
        return "J"
    } else if (card === QUEEN) {
        return "Q"
    } else if (card === KING) {
        return "K"
    } else {
        return card.toString();
    }
}

// returns n fresh decks, concatenated together as one big array
function freshCards(n) {
    var cards = [];
    for (var i=0; i<n; i++) {
        // add another deck of cards
        cards = cards.concat(deckOfCards());
    }
    shuffleCards(cards)
    return cards
}

// shuffles the passed in cards
// this will change the given array, so the caller of this
// function should be aware of that.
function shuffleCards(cards) {
    var j, x, i;
    for (i = cards.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = cards[i];
        cards[i] = cards[j];
        cards[j] = x;
    }
}

// returns true if there are enough cards in the array to play
// another hand of blackjack, or if a fresh deck is needed
function dealerShouldShuffle(cardCount) {
    return SHUFFLE_THRESHOLD > cardCount;
}

// Returns a data structure containing all of the vital game information,
// including score keeping, current state of the deck, etc
//
// @param {Array} players contains a map from player name to their playing function
function setupGame(players, deckCount) {
    var game = {
        deckCards: freshCards(deckCount),
        playedCards: [], // The cards played in previous hands after shuffling, including the current hand (players and dealers showing card)
        players: [],
        dealerShowingCard: null,
        dealerHiddenCard: null
    };
    // add all the players to the game
    for (var k in players) {
        game.players.push({
            name: k,
            score: 0,
            cards: null, // null means the user is not active in the current hand (e.g. they went over 21)
            algorithm: players[k],
        })
    }
    return game
}

/*
*
* MAIN GAME LOGIC STARTS HERE
*
*/

// Setup and play many, many games!
var game = setupGame(PLAYERS, NUMBER_OF_DECKS);
// Do the basic run through of the games
for (var hand=0; hand<NUMBER_OF_HANDS; hand++) {
    // Check if shuffle needed
    if (dealerShouldShuffle(game.deckCards.length)) {
        // reset the cards
        game.deckCards = freshCards(NUMBER_OF_DECKS);
        game.playedCards = [];
    }

    // Deal out cards, two to each player
    for (var i=0; i<game.players.length; i++) {
        var card1 = game.deckCards.pop();
        var card2 = game.deckCards.pop();
        game.players[i].cards = [card1, card2];
        // Add to played cards list
        game.playedCards.push(card1, card2);
    }

    // Give dealer two cards
    game.dealerHiddenCard = game.deckCards.pop();
    game.dealerShowingCard = game.deckCards.pop();
    
    // Go through each player, asking for HITs and STANDs
    // TODO: PASS COPIES OF EACH PIECE OF DATA!
    for (var i=0; i<game.players.length; i++) {
        while (true) {
            var decision = game.players[i].algorithm(game.playedCards, game.players[i].cards, game.dealerShowingCard);
            // If they HIT, deal a card and see if they bust
            if (decision === HIT) {
                // Deal a card from the deck
                game.players[i].cards.push(game.deckCards.pop());
                // Check for a bust
                if (minHandValue(game.players[i].cards) > 21) {
                    // "take away" their cards
                    game.players[i].cards = null;
                    // stop asking them what to do, they lost
                    break;
                }
            } else if (decision === STAND) {
                // stop asking them what to do, they chose to stand
                break;
            } else {
                // we don't understand their decision... just make them lose!
                game.players[i].cards = null
            }
        }
    }

    // Play the dealers hand
    var dealerHand = [game.dealerHiddenCard, game.dealerShowingCard];
    while (true) {
        var dealerHandValues = allHandValues(dealerHand);
        var dealerBestHandValue = bestHandValue(dealerHand);
        // Check if dealer has either >=18 or a hard 17
        if (
            (dealerBestHandValue >=18 && dealerBestHandValue <= 21) // 18 or better
            ||
            (dealerBestHandValue === 17 && minArray(dealerHandValues) === 17) // hard 17
        ) {
            break; // dealer must STAND!
        } else {
            // dealer _must_ HIT
            dealerHand.push(game.deckCards.pop());
            // Check if dealer busts
            if (minArray(allHandValues(dealerHand)) > 21) {
                dealerHand = null // indicate a bust for the dealer
                break; // we are done!
            }
        }
    }

    // Assign wins and losses
    for (var i=0; i<game.players.length; i++) {
        // if the player busted, they lose
        if (game.players[i].cards == null) {
            game.players[i].score--;
            continue;
        } else if (game.players[i].cards != null && dealerHand == null) {
            // player wins because dealer busted and they didnt
            game.players[i].score++;
        } else {
            // check scores
            // note that draws, or "pushes", do not receive a change in score
            if (bestHandValue(game.players[i].cards) > bestHandValue(dealerHand)) {
                game.players[i].score++
            } else if (bestHandValue(game.players[i].cards) < bestHandValue(dealerHand)) {
                game.players[i].score--;
            }
        }
    }
}

// Now let's report the scores
console.log("FINAL SCORES:")
for (var i=0; i<game.players.length; i++) {
    console.log(game.players[i].name + ":\t\t"+game.players[i].score);
}

/*
*
* UTILITY FUNCTIONS, MAYBE USEFUL TO YOUR PLAYING ALGORITHMS
*
*/

function minArray(arr) {
  var min = arr[0];
  for (var i=1; i<arr.length; i++) {
    if (arr[i]<min) {
      min = arr[i];
    }
  }
  return min;
}

// Returns every value a hand could have, considering Aces as both 1 and 11
function allHandValues(cards) {
    var values = [0];
    for (var i=0; i<cards.length; i++) {
        // Either the cards varant value, or 10, if its J, Q, or K
        var newValues = []; // use a secondary array if we are working with an Ace to avoid infinite looping below
        for (var j=0; j<values.length; j++) {
            values[j] += Math.min(cards[i], 10);
            // If it's an Ace, add a new possible value where it's treated as 11 instead of 1
            if (cards[i] === ACE) {
                newValues.push(values[j]+10);
            }
        }
        values = values.concat(newValues);
    }
    // remove duplicates using a map
    var valueMap = {};
    for (var i=0; i<values.length; i++) {
        valueMap[values[i]] = values[i];
    }
    var sortedValues = Object.keys(valueMap);
    // the values are strings; parse them into integers
    for (var i=0; i<sortedValues.length; i++) {
        sortedValues[i] = parseInt(sortedValues[i], 10);
    }
    sortedValues.sort(function(a,b){return a-b;});
    return sortedValues;
}

// Returns the best value of the given hand. If all possible values are over 21,
// returns the smallest value.
function bestHandValue(cards) {
    var possibleValues = allHandValues(cards)
    for (var i=possibleValues.length; i>0; i--) {
        if (possibleValues[i-1] <= 21) {
            return possibleValues[i-1];
        }
    }
    // fall-through in case everything is >21
    return possibleValues[0];
}

// Returns the smallest value of a hand (counting Aces as 1)
function minHandValue(cards) {
    var sum = 0;
    for (var i=0; i<cards.length; i++) {
        // Either the cards constant value, or 10, if its J, Q, or K
        sum += Math.min(cards[i], 10);
    }
    return sum;
}

// Returns the largest value of a hand (counting Aces as 11)
function maxHandValue(cards) {
    var sum = 0;
    for (var i=0; i<cards.length; i++) {
        // Either the cards varant value, or 10, if its J, Q, or K
        sum += Math.min(cards[i], 10);
        // Add an extra 10 for an ace (11 == 1 + 10)
        if (cards[i] === 1) {
            sum += 10;
        }
    }
    return sum;
}

/*
*
* EXAMPLE PLAYER IMPLEMENTATIONS
*
*/

function alwaysHit(cardsPlayed, myCards, dealerShowingCard) {
    return HIT;
}

function alwaysStand(cardsPlayed, myCards, dealerShowingCard) {
    return STAND;
}

function hitUntil17(cardsPlayed, myCards, dealerShowingCard) {
    if (bestHandValue(myCards) < 17) {
        return HIT;
    } else {
        return STAND;
    }
}

