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

export {
    nextMatch
}