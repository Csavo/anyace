const data = {};

function dealACard() {
    const randomNumber = Math.floor(Math.random() * data.deck.length);
    return data.deck.splice(randomNumber, 1)[0];
}

function dealHoleCards(player) {
    player.holeCards.push(dealACard(data.deck), dealACard(data.deck));
    evaluateHand(data.players.hero);
    updateUI();
}

function dealFlop() {
    data.communityCards.push(dealACard(data.deck), dealACard(data.deck), dealACard(data.deck));
    evaluateHand(data.players.hero);
    updateUI();
}

function dealTurnRiver() {
    data.communityCards.push(dealACard(data.deck));
    evaluateHand(data.players.hero);
    updateUI();
}

// straight flush / (poker) / full house / (flush) / straight / (set) / 2 pair / (pair)
function evaluateHand(player) {
    player.availableCards = player.holeCards.concat(data.communityCards);
    player.availableCards.sort((a, b) => a.value - b.value);
    
    if (player.poker) delete player.poker;
    if (player.flushCards) delete player.flushCards;
    if (player.straightCards) delete player.straightCards;
    if (player.sets) delete player.sets;
    if (player.pairs) delete player.pairs;
    
    if (player.hasPair) delete player.hasPair;
    if (player.hasSet) delete player.hasSet;
    if (player.hasPoker) delete player.hasPoker;
    player.counts = {};
    player.availableCards.forEach(function(current) {
        player.counts[current.value] = (player.counts[current.value] || 0) + 1;
        player.counts[current.suit] = (player.counts[current.suit] || 0) + 1;
    });
    for (var e in player.counts) {
        if (player.counts.hasOwnProperty(e) && !isNaN(parseInt(e, 10))) {
            // check for pairs
            if (player.counts[e] === 2) {
                player.hasPair = true;
                if (player.hasOwnProperty('pairs')) {
                    player.pairs.push(returnCards(e));
                } else {
                    player.pairs = [];
                    player.pairs.push(returnCards(e));
                }
            }
            // check for sets
            if (player.counts[e] === 3) {
                player.hasSet = true;
                if (player.hasOwnProperty('sets')) {
                    player.sets.push(returnCards(e));
                } else {
                    player.sets = [];
                    player.sets.push(returnCards(e));
                }
            }
            // check for poker
            if (player.counts[e] === 4) {
                player.hasPoker = true;
                if (player.hasOwnProperty('poker')) {
                    player.poker.push(returnCards(e));
                } else {
                    player.poker = [];
                    player.poker.push(returnCards(e));
                }
            }
        }
        // check for flush
        if (player.counts.hasOwnProperty(e) && isNaN(parseInt(e, 10))) {
            if (player.counts[e] >= 5) {
                player.hasFlush = true;
                if (player.hasOwnProperty('flushCards')) {
                    player.flushCards.push(...player.availableCards.filter(el => el.suit === e));
                } else {
                    player.flushCards = [];
                    player.flushCards.push(...player.availableCards.filter(el => el.suit === e));
                }
            }
        }
    }
    // check for straight flush (if has flush)
    if (player.hasFlush) {
        if (checkStraight(player.flushCards)) {
            player.hasStraightFlush = true;
        }
    }
    // check for full house
    if (!player.hasStraightFlush && !player.hasPoker) {
        if (player.hasSet && (player.hasPair || player.sets.length >= 2)) {
            player.hasBoat = true;
        }
    }
    // check for straight
    if (!player.hasPoker && !player.hasBoat && !player.hasFlush) {
        if (checkStraight(player.availableCards)) {
            player.hasStraight = true;
        }
    }
    // check for 2 pair
    if (!player.hasPoker && !player.hasFlush && !player.hasStraight && !player.hasSet && player.hasPair) {
        if (player.pairs.length >= 2) {
            player.hasTwoPair = true;
        }
    }
    
    function returnCards(e) {
        return player.availableCards.filter(el => el.value === parseInt(e, 10));
    }
    
    function checkStraight(array) {
        // Array is already sorted
        const temp = array.filter((c, i, a) => !i || c.value != a[i-1].value); // Keeps only one card with same value
        if (temp[temp.length-1].value === 14) temp.unshift({ abbr: 'A', value: 1, name: 'Ace' }); // Adds Ace as value of 1 for wheels
        let result = false;
        for (let i = temp.length - 1; i >= 4; i--) {
            if (temp[i].value - temp[i-1].value === 1 && temp[i-1].value - temp[i-2].value === 1 && temp[i-2].value - temp[i-3].value === 1 && temp[i-3].value - temp[i-4].value === 1) {
                player.straightCards = [];
                player.straightCards.push(temp[i-4], temp[i-3], temp[i-2], temp[i-1], temp[i]);
                result = true;
                break;
            }
        }
        return result;
    }
}

function displayHand(player) {
    let handStrength = '';
    switch (true) {
        case player.hasStraightFlush:
            handStrength = `Straight Flush, ${player.straightCards[0].name} to ${player.straightCards[4].name}`;
            break;
        case player.hasPoker:
            handStrength = `Four of a kind ${player.poker[player.poker.length-1][0].name}s`;
            break;
        case player.hasBoat:
            if (player.sets.length === 1) {
                handStrength = `${player.sets[player.sets.length-1][0].name}s full of ${player.pairs[player.pairs.length-1][0].name}s`;
            } else if (player.sets.length === 2) {
                handStrength = `${player.sets[player.sets.length-1][0].name}s full of ${player.sets[player.sets.length-2][0].name}s`;
            }
            break;
        case player.hasFlush:
            handStrength = `Flush, ${player.flushCards[player.flushCards.length-1].name} high`;
            break;
        case player.hasStraight:
            handStrength = `Straight, ${player.straightCards[0].name} to ${player.straightCards[4].name}`;
            break;
        case player.hasSet:
            handStrength = `Three of a kind ${player.sets[player.sets.length-1][0].name}s`;
            break;
        case player.hasTwoPair:
            handStrength = `Two pair, ${player.pairs[player.pairs.length-1][0].name}s and ${player.pairs[player.pairs.length-2][0].name}s`;
            break;
        case player.hasPair:
            handStrength = `Pair of ${player.pairs[player.pairs.length-1][0].name}s`;
            break;
        default:
            handStrength = `High card ${player.availableCards[player.availableCards.length-1].name}`;
    }
    return handStrength.replace('Sixs', 'Sixes');
}

/*
function prettifyCards(array) {
    let str = '';
    array.forEach(function(current) {
        str += current.abbr + current.suit + ' ';
    });
    return str.trim();
}
*/

function updateUI() {
    document.getElementById('hc-0').style.backgroundImage = `url("/svg/cards/${data.players.hero.holeCards[0].abbr}${data.players.hero.holeCards[0].suit}.svg")`;
    document.getElementById('hc-1').style.backgroundImage = `url("/svg/cards/${data.players.hero.holeCards[1].abbr}${data.players.hero.holeCards[1].suit}.svg")`;
    if (data.communityCards.length === 0) {
        document.getElementById('cc-0').style.backgroundImage = `url("/svg/cards/back_green.svg")`;
        document.getElementById('cc-1').style.backgroundImage = `url("/svg/cards/back_green.svg")`;
        document.getElementById('cc-2').style.backgroundImage = `url("/svg/cards/back_green.svg")`;
        document.getElementById('cc-3').style.backgroundImage = `url("/svg/cards/back_green.svg")`;
        document.getElementById('cc-4').style.backgroundImage = `url("/svg/cards/back_green.svg")`;
    }
    if (data.communityCards.length === 3) {
        document.getElementById('cc-0').style.backgroundImage = `url("/svg/cards/${data.communityCards[0].abbr}${data.communityCards[0].suit}.svg")`;
        document.getElementById('cc-1').style.backgroundImage = `url("/svg/cards/${data.communityCards[1].abbr}${data.communityCards[1].suit}.svg")`;
        document.getElementById('cc-2').style.backgroundImage = `url("/svg/cards/${data.communityCards[2].abbr}${data.communityCards[2].suit}.svg")`;
    }
    if (data.communityCards.length === 4) {
        document.getElementById('cc-3').style.backgroundImage = `url("/svg/cards/${data.communityCards[3].abbr}${data.communityCards[3].suit}.svg")`;
    }
    if (data.communityCards.length === 5) {
        document.getElementById('cc-4').style.backgroundImage = `url("/svg/cards/${data.communityCards[4].abbr}${data.communityCards[4].suit}.svg")`;
    }
    document.querySelector('.handstrength').textContent = displayHand(data.players.hero);
    console.log(data);
}

document.querySelector('.btn-nh').addEventListener('click', init);
document.querySelector('.btn-df').addEventListener('click', function() {
    if (data.communityCards.length === 0) {
        dealFlop();
    }
});
document.querySelector('.btn-dt').addEventListener('click', function() {
    if (data.communityCards.length === 3) {
        dealTurnRiver();
    }
});
document.querySelector('.btn-dr').addEventListener('click', function() {
    if (data.communityCards.length === 4) {
        dealTurnRiver();
    }
});

function init() {
    data.deck = [
        { abbr: '2', value: 2, suit: 'c', name: 'Deuce' }, 
        { abbr: '3', value: 3, suit: 'c', name: 'Three' }, 
        { abbr: '4', value: 4, suit: 'c', name: 'Four' }, 
        { abbr: '5', value: 5, suit: 'c', name: 'Five' }, 
        { abbr: '6', value: 6, suit: 'c', name: 'Six' }, 
        { abbr: '7', value: 7, suit: 'c', name: 'Seven' }, 
        { abbr: '8', value: 8, suit: 'c', name: 'Eight' }, 
        { abbr: '9', value: 9, suit: 'c', name: 'Nine' }, 
        { abbr: 'T', value: 10, suit: 'c', name: 'Ten' }, 
        { abbr: 'J', value: 11, suit: 'c', name: 'Jack' }, 
        { abbr: 'Q', value: 12, suit: 'c', name: 'Queen' }, 
        { abbr: 'K', value: 13, suit: 'c', name: 'King' }, 
        { abbr: 'A', value: 14, suit: 'c', name: 'Ace' }, 
        { abbr: '2', value: 2, suit: 'd', name: 'Deuce' }, 
        { abbr: '3', value: 3, suit: 'd', name: 'Three' }, 
        { abbr: '4', value: 4, suit: 'd', name: 'Four' }, 
        { abbr: '5', value: 5, suit: 'd', name: 'Five' }, 
        { abbr: '6', value: 6, suit: 'd', name: 'Six' }, 
        { abbr: '7', value: 7, suit: 'd', name: 'Seven' }, 
        { abbr: '8', value: 8, suit: 'd', name: 'Eight' }, 
        { abbr: '9', value: 9, suit: 'd', name: 'Nine' }, 
        { abbr: 'T', value: 10, suit: 'd', name: 'Ten' }, 
        { abbr: 'J', value: 11, suit: 'd', name: 'Jack' }, 
        { abbr: 'Q', value: 12, suit: 'd', name: 'Queen' }, 
        { abbr: 'K', value: 13, suit: 'd', name: 'King' }, 
        { abbr: 'A', value: 14, suit: 'd', name: 'Ace' },
        { abbr: '2', value: 2, suit: 'h', name: 'Deuce' }, 
        { abbr: '3', value: 3, suit: 'h', name: 'Three' }, 
        { abbr: '4', value: 4, suit: 'h', name: 'Four' }, 
        { abbr: '5', value: 5, suit: 'h', name: 'Five' }, 
        { abbr: '6', value: 6, suit: 'h', name: 'Six' }, 
        { abbr: '7', value: 7, suit: 'h', name: 'Seven' }, 
        { abbr: '8', value: 8, suit: 'h', name: 'Eight' }, 
        { abbr: '9', value: 9, suit: 'h', name: 'Nine' }, 
        { abbr: 'T', value: 10, suit: 'h', name: 'Ten' }, 
        { abbr: 'J', value: 11, suit: 'h', name: 'Jack' }, 
        { abbr: 'Q', value: 12, suit: 'h', name: 'Queen' }, 
        { abbr: 'K', value: 13, suit: 'h', name: 'King' }, 
        { abbr: 'A', value: 14, suit: 'h', name: 'Ace' }, 
        { abbr: '2', value: 2, suit: 's', name: 'Deuce' }, 
        { abbr: '3', value: 3, suit: 's', name: 'Three' }, 
        { abbr: '4', value: 4, suit: 's', name: 'Four' }, 
        { abbr: '5', value: 5, suit: 's', name: 'Five' }, 
        { abbr: '6', value: 6, suit: 's', name: 'Six' }, 
        { abbr: '7', value: 7, suit: 's', name: 'Seven' }, 
        { abbr: '8', value: 8, suit: 's', name: 'Eight' }, 
        { abbr: '9', value: 9, suit: 's', name: 'Nine' }, 
        { abbr: 'T', value: 10, suit: 's', name: 'Ten' }, 
        { abbr: 'J', value: 11, suit: 's', name: 'Jack' }, 
        { abbr: 'Q', value: 12, suit: 's', name: 'Queen' }, 
        { abbr: 'K', value: 13, suit: 's', name: 'King' }, 
        { abbr: 'A', value: 14, suit: 's', name: 'Ace' }
    ];
    data.communityCards = [];
    data.players = {
        hero: {
            holeCards: []
        }
    };
    function shuffle(deck) {
        var i, ri, ti;
        for (i = deck.length - 1; i > 0; i--) {
            ri = Math.floor(Math.random() * (i + 1));
            ti = deck[i];
            deck[i] = deck[ri];
            deck[ri] = ti;
        }
    }
    shuffle(data.deck);
    dealHoleCards(data.players.hero);
}

init();
