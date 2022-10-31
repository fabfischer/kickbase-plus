import moment from "moment"
import api from "@/api/api";
import store from '../store/store'

const nextMatch = (matches, player) => {
    let m = null
    if (matches && matches.length && player) {
        matches.forEach((match) => {
            if (match.t1 && match.t1.i === player.teamId) {
                m = {
                    abbr: match.t2.s,
                    name: match.t2.n,
                    id: match.t2.i,
                    img: '/assets/teams/' + match.t2.i + '.png',
                }
            } else if (match.t2 && match.t2.i === player.teamId) {
                m = {
                    abbr: match.t1.s,
                    name: match.t1.n,
                    id: match.t1.i,
                    img: '/assets/teams/' + match.t1.i + '.png',
                }
            }
        })
    }
    return m
}

const getPositionWording = (positionId) => {
    let position = ''
    switch (positionId) {
        case 1:
            position = 'goalkeeper'
            break;
        case 2:
            position = 'defender'
            break;
        case 3:
            position = 'midfielder'
            break;
        case 4:
            position = 'forward'
            break;
    }
    return position
}

const getBundesligaClubImageUrlById = (id) => {
    return '/assets/teams/' + id + '.png'
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

const offerIsExpired = (offer) => {
    const ts = moment(offer.validUntilDate)
    return ts.isBefore()
}

const getMarketValueGrowth = (id) => {
    if (
        store.getters.getPlayers[id]
        && store.getters.getPlayers[id].marketValues
        && store.getters.getPlayers[id].marketValues.length
        && store.getters.getPlayers[id].marketValues[store.getters.getPlayers[id].marketValues.length - 1]
        && store.getters.getPlayers[id].marketValues[store.getters.getPlayers[id].marketValues.length - 2]
    ) {
        return store.getters.getPlayers[id].marketValues[store.getters.getPlayers[id].marketValues.length - 1].m
            - store.getters.getPlayers[id].marketValues[store.getters.getPlayers[id].marketValues.length - 2].m
    }
    return null
}

const getUserTime = () => {
    return moment().utcOffset(0, true)
}

// "smart"
const smartPlayerStatsLoading = async (playerIds) => {
    store.commit('addLoadingMessage', 'checking the statistics of the players and loading them if necessary')
    let shouldExecuteLoading = false
    if (store.getters.getMarketValueComparisonPlayer === null) {
        shouldExecuteLoading = true
    } else if (store.getters.getMarketValueComparisonPlayer) {
        const currentMarketValueComparisonPlayerStats = await api.loadPlayersStats(store.getters.getMarketValueComparisonPlayer.id, true)
        if (currentMarketValueComparisonPlayerStats.marketValue !== store.getters.getMarketValueComparisonPlayer.marketValue) {
            shouldExecuteLoading = true
        }
    }

    const fetchedPlayers = store.getters.getPlayers
    for (let i = 0; i < playerIds.length; i++) {
        if (shouldExecuteLoading === true || !fetchedPlayers[playerIds[i]]) {
            await api.loadPlayersStats(playerIds[i])
        }
    }

    // check this user's players and take the one with the highest market value
    // we take the highest market value, because this is the most likely to change
    let highestMv = null
    const players = store.getters.getPlayersOfUser
    const playerKeys = Object.keys(players)
    if (playerKeys.length) {
        playerKeys.forEach((playerId) => {
            if (players[playerId]) {
                const player = players[playerId]
                if (highestMv === null || (highestMv && highestMv.marketValue < player.marketValue)) {
                    highestMv = player
                }
            }
        })
    }

    if (highestMv) {
        store.commit('setMarketValueComparison', highestMv)
    }
}

export {
    nextMatch,
    sleep,
    getCalcOffer,
    getPercent,
    isHighOffer,
    offerIsExpired,
    getMarketValueGrowth,
    getBundesligaClubImageUrlById,
    getUserTime,
    smartPlayerStatsLoading,
    getPositionWording,
}