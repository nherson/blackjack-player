# BlackJack Player

This is a BlackJack player that allows for easy plugging of user-provided AI to attempt implementing basic strategy and card counting techniques in code. 

This code was written and designed for use by Fountain Valley High School AP CS Principles students. Code layout and design is such that it falls in line (as much as possible) with the subset of JavaScript that the students have learned throughout the course of the year.

## Overview

The code is just a single file, using the most simplistic data structures possible. The constants at the top of the file can be tweaked to tune the basic behavior of the game, such as number of decks used, number of hands played, threshold when the deck should be shuffled.

## Adding a Player

1. Write a function that takes three arguments: array of all cards played since last shuffle, array of your cards so far this hand, the card showing for the dealer. It should return either the constant `HIT` or `STAND` to indicate your intention.
2. Add a player name to the `PLAYERS` map at the top of the file, where the value is your function.

