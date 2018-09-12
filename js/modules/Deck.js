/**
* the DECK controller module
*/

export default class Deck {
    constructor() {
        this.deck = [
            { abbr: '2c', value: 2 }, 
            { abbr: '3c', value: 3 }, 
            { abbr: '4c', value: 4 }, 
            { abbr: '5c', value: 5 }, 
            { abbr: '6c', value: 6 }, 
            { abbr: '7c', value: 7 }, 
            { abbr: '8c', value: 8 }, 
            { abbr: '9c', value: 9 }, 
            { abbr: 'Tc', value: 10 }, 
            { abbr: 'Jc', value: 11 }, 
            { abbr: 'Qc', value: 12 }, 
            { abbr: 'Kc', value: 13 }, 
            { abbr: 'Ac', value: 14 }, 
            { abbr: '2d', value: 2 }, 
            { abbr: '3d', value: 3 }, 
            { abbr: '4d', value: 4 }, 
            { abbr: '5d', value: 5 }, 
            { abbr: '6d', value: 6 }, 
            { abbr: '7d', value: 7 }, 
            { abbr: '8d', value: 8 }, 
            { abbr: '9d', value: 9 }, 
            { abbr: 'Td', value: 10 }, 
            { abbr: 'Jd', value: 11 }, 
            { abbr: 'Qd', value: 12 }, 
            { abbr: 'Kd', value: 13 }, 
            { abbr: 'Ad', value: 14 },
            { abbr: '2h', value: 2 }, 
            { abbr: '3h', value: 3 }, 
            { abbr: '4h', value: 4 }, 
            { abbr: '5h', value: 5 }, 
            { abbr: '6h', value: 6 }, 
            { abbr: '7h', value: 7 }, 
            { abbr: '8h', value: 8 }, 
            { abbr: '9h', value: 9 }, 
            { abbr: 'Th', value: 10 }, 
            { abbr: 'Jh', value: 11 }, 
            { abbr: 'Qh', value: 12 }, 
            { abbr: 'Kh', value: 13 }, 
            { abbr: 'Ah', value: 14 }, 
            { abbr: '2s', value: 2 }, 
            { abbr: '3s', value: 3 }, 
            { abbr: '4s', value: 4 }, 
            { abbr: '5s', value: 5 }, 
            { abbr: '6s', value: 6 }, 
            { abbr: '7s', value: 7 }, 
            { abbr: '8s', value: 8 }, 
            { abbr: '9s', value: 9 }, 
            { abbr: 'Ts', value: 10 }, 
            { abbr: 'Js', value: 11 }, 
            { abbr: 'Qs', value: 12 }, 
            { abbr: 'Ks', value: 13 }, 
            { abbr: 'As', value: 14 }
        ]
    }

    shuffle() {
        var i, rndmi, tmpi;
        for (i = this.deck.length - 1; i > 0; i--) {
            rndmi = Math.floor(Math.random() * (i + 1));
            tmpi = this.deck[i];
            this.deck[i] = this.deck[rndmi];
            this.deck[rndmi] = tmpi;
        }
    }
}