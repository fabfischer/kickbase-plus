import axios from 'axios'
import moment from 'moment'

import store from '../store/store'
import Constants from "../Constants";
import {sleep, smartPlayerStatsLoading} from "@/helper/helper";

axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response && error.response.status === 403) {
        localStorage.removeItem(Constants.LOCALSTORAGE.BEARER_TOKEN)
        localStorage.removeItem(Constants.LOCALSTORAGE.BEARER_TOKEN_EXPIRATION)
        window.location.reload()
    }
    return Promise.reject(error);
});

const api = {
    requestStack: {},
    getToken() {
        return 'Bearer ' + localStorage.getItem(Constants.LOCALSTORAGE.BEARER_TOKEN)
    },
    checkForCredentials() {
        if (localStorage.getItem('user') &&
            localStorage.getItem('password') &&
            localStorage.getItem('user') !== "" &&
            localStorage.getItem('password') !== ""
        ) {
            return true
        }
        return false
    },
    async loadClubs() {
        await axios({
            'url': 'https://api.kickbase.com/v2/competitions/1/overview',
            "method": 'GET',
            'data': {},
        })
            .then(async (response) => {
                if (response.status === 200) {
                    if (response.data && response.data.day) {
                        const nextGameDay = {
                            no: response.data.day,
                            ts: response.data.d,
                            nts: moment(response.data.d),
                            countdown: (response.data.m && response.data.m.ttm) ? response.data.m.ttm : null
                        }
                        let teams = [];

                        await axios({
                            'url': 'https://api.kickbase.com/v2/competitions/1/matches?',
                            "method": 'GET',
                            'data': {},
                        }).then((nextGameMatchResponse) => {
                            if (nextGameMatchResponse.data && nextGameMatchResponse.data.day === nextGameDay.no) {
                                nextGameDay.matches = nextGameMatchResponse.data.e
                                store.commit('setNextMatchDay', nextGameDay)
                                if (nextGameMatchResponse.data.e && nextGameMatchResponse.data.e.length) {
                                    nextGameMatchResponse.data.e.forEach((match) => {
                                        if (match.t1) {
                                            teams.push(match.t1)
                                        }
                                        if (match.t2) {
                                            teams.push(match.t2)
                                        }
                                    })

                                    teams = teams.sort((a, b) => {
                                        if (a.n > b.n) {
                                            return 1;
                                        }
                                        if (a.n < b.n) {
                                            return -1;
                                        }
                                        return 0;
                                    })
                                    store.commit('setTeams', teams)
                                }
                            }

                        })
                    }
                }
            })
    },
    async checkBonusState() {
        store.commit('addLoadingMessage', 'checking daily bonus')
        await axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/currentgift',
            "method": 'GET',
            'data': {},
        })
            .then((response) => {
                if (response.status === 200) {

                    if (response.data) {
                        if (response.data.amount !== 0) {
                            store.commit('setGiftLevel', response.data.level)
                            store.commit('setGiftBonus', response.data.amount)
                            localStorage.setItem(
                                Constants.LOCALSTORAGE.GIFT_DATA,
                                JSON.stringify(
                                    {
                                        level: response.data.level,
                                        amount: response.data.amount
                                    }
                                )
                            )
                        } else {
                            let lsGiftData = localStorage.getItem(Constants.LOCALSTORAGE.GIFT_DATA)
                            let hasGiftDetails = false
                            if (lsGiftData) {
                                lsGiftData = JSON.parse(lsGiftData)
                                if (lsGiftData && lsGiftData.level) {
                                    store.commit('setGiftLevel', lsGiftData.level)
                                    store.commit('setGiftBonus', lsGiftData.amount)
                                    hasGiftDetails = true
                                }
                            }
                            if (hasGiftDetails === false) {
                                store.commit('setGiftLevel', 'collected')

                            }
                        }
                        if (response.data.isAvailable) {
                            axios({
                                'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/collectgift',
                                "method": 'POST',
                                'data': {},
                            })
                                .then((response) => {
                                    if (response.status === 200) {
                                        if (response.data && response.data.err === 0) {
                                            store.commit('setFetchedGift', true)
                                        } else {
                                            store.commit('setFetchedGift', false)
                                        }
                                    } else {
                                        store.commit('setErrorMessage', 'could not find token data')
                                    }
                                })
                        } else {
                            store.commit('setFetchedGift', true)
                        }
                    } else {
                        store.commit('setErrorMessage', 'could not find token data')
                    }
                }
            })
            .catch(function () {
                // TODO: IMPROVE
                let lsGiftData = localStorage.getItem(Constants.LOCALSTORAGE.GIFT_DATA)
                let hasGiftDetails = false
                if (lsGiftData) {
                    lsGiftData = JSON.parse(lsGiftData)
                    if (lsGiftData && lsGiftData.level) {
                        store.commit('setGiftLevel', lsGiftData.level)
                        store.commit('setGiftBonus', lsGiftData.amount)
                        hasGiftDetails = true
                    }
                }
                if (hasGiftDetails === false) {
                    store.commit('setGiftLevel', 'collected')
                }
                // store.commit('setErrorMessage', 'could not fetch gift/bonus status')
            })
    },
    login() {
        axios({
            'url': 'https://api.kickbase.com/user/login',
            "method": 'POST',
            'data': {
                'email': localStorage.getItem('user'),
                'password': localStorage.getItem('password'),
                'ext': true,
            }
        })
            .then((response) => {
                if (response.status === 200) {

                    if (response.data.token && response.data.tokenExp) {
                        localStorage.setItem(Constants.LOCALSTORAGE.BEARER_TOKEN, response.data.token)
                        localStorage.setItem(Constants.LOCALSTORAGE.BEARER_TOKEN_EXPIRATION, response.data.tokenExp)
                        store.commit('setLoading', true)

                        window.location.reload()
                    } else {
                        store.commit('setErrorMessage', 'could not find token data')
                    }
                }
            })
            .catch(function () {
                store.commit('setErrorMessage', 'login issues')
            })
    },
    loadRanking(cb) {
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/stats',
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    if (response.data && response.data.users && response.data.matchDays) {
                        store.commit('setRanking', response.data)
                        if (typeof cb === 'function') {
                            cb()
                        }
                    }
                }
            }).catch(function () {
            store.commit('addErrorLoadingMessage', 'could not fetch ranking')
            store.commit('setErrorMessage', 'could not fetch ranking')
        })
    },
    async loadPersonalData(cb, showLoading = true) {
        if (showLoading) {
            store.commit('setLoading', true)
            store.commit('addLoadingMessage', 'loading personal data. please wait')
        }
        await axios({
            'url': 'https://api.kickbase.com/user/settings',
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    if (response.data && response.data.user && response.data.user.id) {
                        store.commit('setSelfData', response.data.user)
                        store.commit('setSelf', response.data.user.id * 1)
                        if (typeof cb === 'function') {
                            cb()
                        }
                    }
                }
            }).catch(function () {
                if (showLoading) {
                    store.commit('addErrorLoadingMessage', 'could not fetch user data')
                    store.commit('setErrorMessage', 'could not fetch user data')
                }
            })
    },
    async loadLeagues() {
        store.commit('setLoading', true)
        store.commit('addLoadingMessage', 'loading leagues. please wait')
        await axios({
            'url': 'https://api.kickbase.com/leagues?ext=true',
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    store.commit('addLoadingMessage', 'player\'s league successfully fetched')
                    if (response.data && response.data.leagues && response.data.leagues.length) {
                        store.commit('setLeagues', response.data.leagues)
                        let setLeague = null
                        if (localStorage.getItem('league')) {
                            response.data.leagues.forEach((league) => {
                                if (league.id === localStorage.getItem('league')) {
                                    store.commit('setLeague', league.id)
                                    setLeague = league
                                }
                            })
                        }
                        if (setLeague === null) {
                            setLeague = response.data.leagues[0]
                            localStorage.setItem('league', setLeague.id)
                            store.commit('setLeague', setLeague.id)
                        }
                        store.commit('addLoadingMessage', 'set league: ' + setLeague.name)
                    }
                }
            }).catch(function () {
                store.commit('addErrorLoadingMessage', 'could not fetch player\'s leagues')
                store.commit('setErrorMessage', 'could not fetch player\'s leagues')
            })
    },
    async loadUsersPlayerOffers() {
        store.commit('addLoadingMessage', 'loading market offers')
        return await axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/market',
            "method": "GET",
        })
            .then(async (response) => {
                if (response.status === 200) {
                    store.commit('addLoadingMessage', 'offers successfully fetched ... please wait')
                    return response.data
                }
            }).catch(function () {
            store.commit('addErrorLoadingMessage', 'could not fetch player\'s offers')
            store.commit('setErrorMessage', 'could not fetch player\'s offers')
        })

    },
    async loadBids(fetchStats, cb) {
        await axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/market',
            "method": "GET",
        })
            .then(async (response) => {
                if (response.status === 200) {
                    const players = response.data.players

                    players.sort((a, b) => (a.expiry > b.expiry) ? 1 : -1)

                    const cleanedPlayers = []
                    players.forEach((player) => {
                        let shouldAdd = true

                        if (player.userId * 1 === store.getters.getSelf) {
                            shouldAdd = false
                        }
                        if (shouldAdd) {
                            cleanedPlayers.push(player)
                        }
                    })

                    if (fetchStats) {
                        const playerIds = []
                        for (const player of cleanedPlayers) {
                            if (!player.userId) {
                                playerIds.push(player.id)
                            }
                        }
                        await smartPlayerStatsLoading(playerIds)
                    }
                    store.commit('setBids', cleanedPlayers)
                    if (typeof cb === 'function') {
                        cb()
                    }
                }
            })
            .catch(function () {
                store.commit('setErrorMessage', 'could not fetch transfer market')
            })
            .finally(function () {
            })
    },
    async loadPlayersPoints(playerId) {
        const rId = 'p' + playerId
        const controller = new AbortController();

        if (this.requestStack[rId]) {
            this.requestStack[rId].abort()
        }

        this.requestStack[rId] = controller

        return await axios({
            signal: controller.signal,
            'url': 'https://api.kickbase.com/players/' + playerId + '/points',
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    return response.data
                }
            })
            .catch(function () {
                // store.commit('setErrorMessage', 'could not fetch details of player with id: ' + playerId)
            })
            .finally(() => {
                if (this.requestStack[rId]) {
                    delete this.requestStack[rId]
                }
            })
    },
    async loadPlayersStats(playerId, justReturnAsPromise = false) {
        const controller = new AbortController();

        if (this.requestStack[playerId]) {
            this.requestStack[playerId].abort()
        }

        this.requestStack[playerId] = controller

        return await axios({
            signal: controller.signal,
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/players/' + playerId + '/stats',
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    if (justReturnAsPromise === true) {
                        return response.data
                    } else {
                        store.commit('addPlayer', response.data)
                    }
                }
            })
            .catch(function () {
                // store.commit('setErrorMessage', 'could not fetch details of player with id: ' + playerId)
            })
            .finally(() => {
                if (this.requestStack[playerId]) {
                    delete this.requestStack[playerId]
                }
            })
    },
    async loadUsersStats(includeUsersToUpdateBudget = false) {
        store.commit('addLoadingMessage', 'loading details of user')
        await axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/users/' + store.getters.getSelf + '/profile',
            "method": "GET",
        }).then(async (profile) => {
            if (profile.data) {
                if (includeUsersToUpdateBudget === true) {
                    await api.loadUsers(includeUsersToUpdateBudget)
                }
                const userX = Object.assign(store.getters.getUsersDetails, profile.data)
                store.commit('addUser', userX)
                await api.loadUsersPlayers(userX.id, true)
            }
        })
            .catch(function () {
                store.commit('setErrorMessage', 'could not fetch own profile')
            });
    },
    async loadUsers(justToUpdateBudget = false) {
        store.commit('addLoadingMessage', 'getting league\'s stats')
        await axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/stats',
            "method": "GET",
        })
            .then(async (response) => {
                if (response.status === 200) {
                    if (response.data && response.data.users && response.data.users.length) {
                        for (let i = 0; i < response.data.users.length; i++) {
                            const player = response.data.users[i]
                            store.commit('addUser', player)
                            if (justToUpdateBudget === false) {
                                await api.loadUsersPlayers(player.id, false)
                            }
                        }
                    }
                }
            })
            .catch(function () {
                store.commit('setErrorMessage', 'could not fetch league stats')
            })
    },
    saveLineup(data, cb, errorCb) {
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/lineup',
            "method": "POST",
            data
        })
            .then((response) => {
                if (response.status === 200 && response.data.err === 0) {
                    cb(response.data)
                } else {
                    store.commit('setErrorMessage', 'could not save lineup')
                }
            })
            .catch(function () {
                errorCb()
                store.commit('setErrorMessage', 'could not save lineup')
            })
    },
    loadLineup(cb) {
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/lineupex',
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    cb(response.data)
                }
            })
            .catch(function () {
                store.commit('setErrorMessage', 'could not fetch lineup')
            })
    },
    async loadNextTwoMatchDays() {
        const currentMatchDay = store.getters.getNextMatchDay
        const fetchedGameDays = []
        if (currentMatchDay.no) {
            fetchedGameDays.push({m: currentMatchDay.matches, md: currentMatchDay.no, d: currentMatchDay.no})
            store.commit('addLoadingMessage', 'loading next matchdays for stats')
            const gameDays = [currentMatchDay.no + 1, currentMatchDay.no + 2]
            for (let i = 0; i < gameDays.length; i++) {
                if (gameDays[i] <= 34) {
                    const matchDay = await axios({
                        'url': 'https://api.kickbase.com/v2/competitions/1/matches?matchDay=' + gameDays[i],
                        "method": "GET",
                    })
                        .then(async (response) => {
                            if (response.data && response.data.e && response.data.e.length) {
                                return response.data
                            }
                        })
                        .catch(function () {
                        })
                    if (matchDay.nd) {
                        fetchedGameDays.push({
                            d: matchDay.day,
                            m: matchDay.e,
                            md: matchDay.day
                        })
                    }
                }
            }
        }
        if (fetchedGameDays.length) {
            store.commit('setNextThreeMatchDays', fetchedGameDays)
        }
    },
    async loadMatches(matchDay) {
        let mQuery = ''
        if (matchDay) {
            mQuery = '?matchDay=' + matchDay
        }
        store.commit('addLoadingMessage', 'loading next matchday')
        await axios({
            'url': 'https://api.kickbase.com/v2/competitions/1/matches' + mQuery,
            "method": "GET",
        })
            .then(async (response) => {
                if (response.data && response.data.e && response.data.e.length) {
                    const lastMatch = response.data.e[response.data.e.length - 1]
                    if (moment(lastMatch.d).isSameOrAfter(new Date(), 'day') === true) {
                        const lNextDay = store.getters.getNextMatchDay
                        const nextGameDay = Object.assign(lNextDay, {
                            no: response.data.day,
                            ts: response.data.e[0].d,
                            nts: moment(response.data.e[0].d),
                            matches: response.data.e
                        })
                        const matches = response.data.e.map((match) => {
                            match.md = response.data.day
                            return match
                        })
                        store.commit('setMatches', matches)
                        store.commit('setNextMatchDay', nextGameDay)
                    } else {
                        const nextMatchday = response.data.day + 1
                        if (nextMatchday <= 34) {
                            await api.loadMatches(nextMatchday)
                        }
                    }
                }
            })
            .catch(function () {
                store.commit('setErrorMessage', 'could not fetch matchday')
            })
    },
    async loadFeed(cb) {
        await axios({
            'url': 'https://api.kickbase.com/v2/leagues/' + store.getters.getLeague + '/feed',
            "method": "GET",
            'params': {
                start: 0,
                filter: '3,5,13,15,16,17'
            }
        })
            .then(async (response) => {
                if (response.status === 200) {
                    await cb(response.data)
                }
            })
            .catch(function () {
                store.commit('setErrorMessage', 'could not fetch feed')
            })
            .finally(function () {
            });
    },
    async loadUsersPlayers(userId, loadPlayerStates = true) {
        const user = userId
        store.commit('addLoadingMessage', 'loading players of user #' + user)
        await axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/users/' + user + '/players',
            "method": "GET",
        }).then(async (response) => {
            if (response.status === 200) {
                store.commit('addUsersPlayer', {
                    user,
                    players: response.data.players
                })
                if (loadPlayerStates === true) {
                    const playerIds = []
                    for (let i = 0; i < response.data.players.length; i++) {
                        playerIds.push(response.data.players[i].id)
                    }
                    await smartPlayerStatsLoading(playerIds)
                }
            }
        })
    },
    loadGlobalLiveData(cb) {
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/live',
            "method": "GET",
        }).then((response) => {
            if (response.status === 200) {
                if (response.data) {
                    store.commit('setLiveData', response.data)
                }
                if (typeof cb === 'function') {
                    cb()
                }
            }
        })
    },
    sendBid(playerId, price, callback, multi, errorCb) {
        const cb = callback
        const getBidReq = () => {
            return axios.post(
                'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/market/' + playerId + '/offers',
                {
                    price
                }
            )
        }

        const reqs = [
            getBidReq()
        ]
        if (multi === true) {
            reqs.push(getBidReq())
            reqs.push(getBidReq())
        }

        axios.all(reqs).then(axios.spread((...responses) => {
            const responseOne = responses[0]
            if (responseOne.status === 200) {
                if (typeof cb === 'function') {
                    cb(responseOne.data)
                }
            }
        })).catch(errors => {
            console.warn(errors)
            if (errors.response && errors.response.data) {
                if (errors.response.data.err === 5060) {
                    // store.commit('setErrorMessage', errors.response.data.errMsg)
                    store.commit('setErrorMessage', 'offer too low')
                }
                if (errors.response.data.err === 5050) {
                    // ThirtyThreePercentRuleExceeded
                    store.commit('setErrorMessage', 'you reached your financial limit (max. 33% debt of your team\'s market value)')
                }
                if (errors.response.data.err === 5030) {
                    // ThirtyThreePercentRuleExceeded
                    store.commit('setErrorMessage', 'You have reached the limit for players per team (max. ' + store.getters.getSelectedLeague.pl + ' players)')
                }
                if (errors.response.data.err === 5070) {
                    // ThirtyThreePercentRuleExceeded
                    store.commit('setErrorMessage', 'You have reached the limit for players of this Bundesliga team (max. ' + store.getters.getSelectedLeague.mpst + ' players)')
                }
            }
            if (typeof errorCb === 'function') {
                errorCb()
            }
        })

    },
    async revokeBid(playerId, offerId, callback) {
        const cb = callback
        await axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/market/' + playerId + '/offers/' + offerId,
            "method": "DELETE"
        }).then(async (response) => {
            if (response.status === 200) {
                if (typeof cb === 'function') {
                    await cb(response.data)
                }
            }
        })
    },
    async putOnMarket(player, callback) {
        store.commit('addLoadingMessage', 'trying to put player "' + player.lastName + '" on market')

        const cb = callback
        let price = player.marketValue + ""

        await axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/market',
            "method": "POST",
            'data': {
                playerId: player.id,
                price
            },
        }).then(async (response) => {
            if (response.status === 200) {
                store.commit('addLoadingMessage', 'player successfully put on market')
                if (typeof cb === 'function') {
                    await cb(response)
                }
            }
        }).catch(errors => {
            console.warn(errors)
            store.commit('addErrorLoadingMessage', 'error occured during putting player on market. lets try it again')
            api.putOnMarket(player, cb)
        })
    },
    async removePlayerFromMarket(player, callback) {
        store.commit('addLoadingMessage', 'removing player "' + player.lastName + '" from market')
        const cb = callback
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/market/' + player.id,
            "method": 'DELETE',
        })
            .then((response) => {
                if (response.status === 200) {
                    if (typeof cb === 'function') {
                        store.commit('addLoadingMessage', 'removed player "' + player.lastName + '" from market')
                        cb(response.data)
                    }
                }
            })
            .catch(function () {
                store.commit('setErrorMessage', 'could not remove player from market')
            })
    },
    async setPlayerOnMarketAgain(player) {
        store.commit('setLoading', true)
        await api.removePlayerFromMarket(player)
        await sleep(500)
        await api.putOnMarket(player)
    },
    acceptBids(offer, callback) {
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/market/' + offer.playerId + '/offers/' + offer.offerId + '/accept',
            "method": "POST",
        }).then((first) => {
            if (first.status === 200) {
                if (typeof callback === 'function') {
                    callback()
                }
            }
        })

    }
}
axios.defaults.headers.common['Authorization'] = api.getToken();

export default api