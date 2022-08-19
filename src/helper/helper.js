const nextMatch = (matches, player) => {
    let m = null
    if (matches && matches.length && player) {
        matches.forEach((match) => {
            if (match.t1i === player.teamId || match.t2i === player.teamId) {
                if (match.t1i === player.teamId) {
                    m = {
                        abbr: match.t2y,
                        name: match.t2n,
                        id: match.t2i,
                        img: '/assets/teams/' + match.t2i + '.png',
                    }
                } else if (match.t2i === player.teamId) {
                    m = {
                        abbr: match.t1y,
                        name: match.t1n,
                        id: match.t1i,
                        img: '/assets/teams/' + match.t1i + '.png',
                    }
                }
                return
            }
        })
    }
    return m
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getCalcOffer = (offer, marketValue) => {
    return (offer.price) - marketValue
}
const getPercent = (player, offer) => {
    const calc = getCalcOffer(offer, player.marketValue)
    return Number.parseFloat((calc / player.marketValue * 100)).toPrecision(2)
}
const isHighOffer = (player, offer, threshold) => {
    return (getPercent(player, offer) >= threshold)
}

export {
    nextMatch,
    sleep,
    getCalcOffer,
    getPercent,
    isHighOffer,
}