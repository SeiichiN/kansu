var L = {
    name: "L",
    score: 10
};

var R = {
    name: "R",
    score: 20
};

var winner = (playerL, playerR) => {
    if (playerR.score > playerL.score) {
        console.log(playerR.name + "が勝者です。");
    } else if (playerR.score < playerL.score) {
        console.log(playerL.name + "が勝者です。");
    } else {
        console.log("引き分けです。");
    }
};

var judge = (playerL, playerR) => {
    if (playerR.score > playerL.score) {
        return playerR;
    } else if (playerR.score < playerL.score) {
        return playerL;
    } else {
        return null;
    }
};

var announce = (winner) => {
    if (winner) {
        return winner.name + "が勝者です。";
    } else {
        return "引き分けです。";
    }
};

var displayWinner = (winner) => {
    console.log(announce(winner));
};

