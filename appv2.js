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
        player.counts[current.abbr[1]] = (player.counts[current.abbr[1]] || 0) + 1;
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
    document.getElementById('hc-0').style.backgroundImage = `url("/svg/cards/${data.players.hero.holeCards[0].abbr}.svg")`;
    document.getElementById('hc-1').style.backgroundImage = `url("/svg/cards/${data.players.hero.holeCards[1].abbr}.svg")`;
    if (data.communityCards.length === 0) {
        document.getElementById('cc-0').style.backgroundImage = `url("/svg/cards/back_green.svg")`;
        document.getElementById('cc-1').style.backgroundImage = `url("/svg/cards/back_green.svg")`;
        document.getElementById('cc-2').style.backgroundImage = `url("/svg/cards/back_green.svg")`;
        document.getElementById('cc-3').style.backgroundImage = `url("/svg/cards/back_green.svg")`;
        document.getElementById('cc-4').style.backgroundImage = `url("/svg/cards/back_green.svg")`;
    }
    if (data.communityCards.length === 3) {
        document.getElementById('cc-0').style.backgroundImage = `url("/svg/cards/${data.communityCards[0].abbr}.svg")`;
        document.getElementById('cc-1').style.backgroundImage = `url("/svg/cards/${data.communityCards[1].abbr}.svg")`;
        document.getElementById('cc-2').style.backgroundImage = `url("/svg/cards/${data.communityCards[2].abbr}.svg")`;
    }
    if (data.communityCards.length === 4) {
        document.getElementById('cc-3').style.backgroundImage = `url("/svg/cards/${data.communityCards[3].abbr}.svg")`;
    }
    if (data.communityCards.length === 5) {
        document.getElementById('cc-4').style.backgroundImage = `url("/svg/cards/${data.communityCards[4].abbr}.svg")`;
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
        { abbr: '2c', value: 2, name: 'Deuce' }, 
        { abbr: '3c', value: 3, name: 'Three' }, 
        { abbr: '4c', value: 4, name: 'Four' }, 
        { abbr: '5c', value: 5, name: 'Five' }, 
        { abbr: '6c', value: 6, name: 'Six' }, 
        { abbr: '7c', value: 7, name: 'Seven' }, 
        { abbr: '8c', value: 8, name: 'Eight' }, 
        { abbr: '9c', value: 9, name: 'Nine' }, 
        { abbr: 'Tc', value: 10, name: 'Ten' }, 
        { abbr: 'Jc', value: 11, name: 'Jack' }, 
        { abbr: 'Qc', value: 12, name: 'Queen' }, 
        { abbr: 'Kc', value: 13, name: 'King' }, 
        { abbr: 'Ac', value: 14, name: 'Ace' }, 
        { abbr: '2d', value: 2, name: 'Deuce' }, 
        { abbr: '3d', value: 3, name: 'Three' }, 
        { abbr: '4d', value: 4, name: 'Four' }, 
        { abbr: '5d', value: 5, name: 'Five' }, 
        { abbr: '6d', value: 6, name: 'Six' }, 
        { abbr: '7d', value: 7, name: 'Seven' }, 
        { abbr: '8d', value: 8, name: 'Eight' }, 
        { abbr: '9d', value: 9, name: 'Nine' }, 
        { abbr: 'Td', value: 10, name: 'Ten' }, 
        { abbr: 'Jd', value: 11, name: 'Jack' }, 
        { abbr: 'Qd', value: 12, name: 'Queen' }, 
        { abbr: 'Kd', value: 13, name: 'King' }, 
        { abbr: 'Ad', value: 14, name: 'Ace' },
        { abbr: '2h', value: 2, name: 'Deuce' }, 
        { abbr: '3h', value: 3, name: 'Three' }, 
        { abbr: '4h', value: 4, name: 'Four' }, 
        { abbr: '5h', value: 5, name: 'Five' }, 
        { abbr: '6h', value: 6, name: 'Six' }, 
        { abbr: '7h', value: 7, name: 'Seven' }, 
        { abbr: '8h', value: 8, name: 'Eight' }, 
        { abbr: '9h', value: 9, name: 'Nine' }, 
        { abbr: 'Th', value: 10, name: 'Ten' }, 
        { abbr: 'Jh', value: 11, name: 'Jack' }, 
        { abbr: 'Qh', value: 12, name: 'Queen' }, 
        { abbr: 'Kh', value: 13, name: 'King' }, 
        { abbr: 'Ah', value: 14, name: 'Ace' }, 
        { abbr: '2s', value: 2, name: 'Deuce' }, 
        { abbr: '3s', value: 3, name: 'Three' }, 
        { abbr: '4s', value: 4, name: 'Four' }, 
        { abbr: '5s', value: 5, name: 'Five' }, 
        { abbr: '6s', value: 6, name: 'Six' }, 
        { abbr: '7s', value: 7, name: 'Seven' }, 
        { abbr: '8s', value: 8, name: 'Eight' }, 
        { abbr: '9s', value: 9, name: 'Nine' }, 
        { abbr: 'Ts', value: 10, name: 'Ten' }, 
        { abbr: 'Js', value: 11, name: 'Jack' }, 
        { abbr: 'Qs', value: 12, name: 'Queen' }, 
        { abbr: 'Ks', value: 13, name: 'King' }, 
        { abbr: 'As', value: 14, name: 'Ace' }
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
