import axios from 'axios'

import store from '../store/store'
import Constants from "../Constants";
import {sleep} from "@/helper/helper";

const getTodaysDateAsString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    return dd + '.' + mm + '.' + yyyy;
}

const api = {
    getToken() {
        return 'Bearer ' + localStorage.getItem('token')
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
    checkBonusState() {
        axios({
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
                console.log(localStorage.getItem(Constants.LOCALSTORAGE.GIFT_DATA), Constants.LOCALSTORAGE.GIFT_DATA, localStorage)
                let hasGiftDetails = false
                if (lsGiftData) {
                    console.log(lsGiftData)
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
                        localStorage.setItem('token', response.data.token)
                        localStorage.setItem('tokenExp', response.data.tokenExp)
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
    loadPersonalData(cb, showLoading = true) {
        if (showLoading) {
            store.commit('setLoading', true)
            store.commit('addLoadingMessage', 'loading personal data. please wait')
        }
        axios({
            'url': 'https://api.kickbase.com/user/settings',
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    if (response.data && response.data.user && response.data.user.id) {
                        store.commit('setSelfData', response.data.user)
                        store.commit('setSelf', response.data.user.id * 1)
                        cb()
                    }
                }
            }).catch(function () {
            if (showLoading) {
                store.commit('addErrorLoadingMessage', 'could not fetch user data')
                store.commit('setErrorMessage', 'could not fetch user data')
            }
        })
    },
    loadLeagues(cb) {
        store.commit('setLoading', true)
        store.commit('addLoadingMessage', 'loading leagues. please wait')
        axios({
            'url': 'https://api.kickbase.com/leagues?ext=true',
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    store.commit('addLoadingMessage', 'fetched player\'s league successfully')
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
                        cb()
                        window.setTimeout(() => {
                            store.commit('setLoading', false)
                        }, 1000)
                    }
                }
            }).catch(function () {
            store.commit('addErrorLoadingMessage', 'could not fetch player\'s leagues')
            store.commit('setErrorMessage', 'could not fetch player\'s leagues')
        })
    },
    loadUsersPlayerOffers(cb) {
        store.commit('addLoadingMessage', 'loading market offers')
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/market',
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    store.commit('addLoadingMessage', 'fetched offers successfully')
                    if (typeof cb === 'function') {
                        cb(response.data)
                    }
                }
            }).catch(function () {
            store.commit('addErrorLoadingMessage', 'could not fetch player\'s offers')
            store.commit('setErrorMessage', 'could not fetch player\'s offers')
        })

    },
    async loadBids(fetchStats, cb) {
        axios({
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
                        cleanedPlayers.forEach(async (player) => {
                            if (!player.userId) {
                                await this.loadPlayersStats(player.id)
                            }
                        })
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
    loadPlayersStats(playerId, callback, force) {
        const todayAsString = getTodaysDateAsString()
        const currentStatsFetchedData = store.getters.getPlayersStatsFetched

        const players = store.getters.getPlayers
        if (players
            && players.length
            && players[playerId]
            && players[playerId].marketValues
            && players[playerId].marketValues.length
            && currentStatsFetchedData[playerId] === todayAsString
        ) {
            if (typeof callback === 'function') {
                callback()
            }
        }

        if (currentStatsFetchedData[playerId] !== todayAsString || force === true) {
            axios({
                'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/players/' + playerId + '/stats',
                "method": "GET",
            })
                .then((response) => {
                    if (response.status === 200) {
                        if (typeof callback === 'function') {
                            callback()
                        }
                        store.commit('addPlayer', response.data)
                        store.commit('addPlayersStatsFetched', {playerId, value: todayAsString})
                    }
                })
                .catch(function () {
                    store.commit('setErrorMessage', 'could not fetch details of player with id: ' + playerId)
                })
                .finally(function () {
                })
        }
    },
    loadUsers(loadPlayerStats = true) {
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/stats',
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    response.data.users.forEach((player) => {
                        if (player.id * 1 === store.getters.getSelf) {
                            this.loadUsersStats(player, loadPlayerStats)
                        } else {
                            api.loadUsersPlayer(player.id, false)
                        }
                    })
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
    loadMatches(matchDay, cb) {
        let mQuery = ''
        if (matchDay) {
            mQuery = '?matchDay=' + matchDay
        }
        axios({
            'url': 'https://api.kickbase.com/competition/matches' + mQuery,
            "method": "GET",
        })
            .then((response) => {
                if (response.status === 200) {
                    cb(response.data)
                }
            })
            .catch(function () {
                store.commit('setErrorMessage', 'could not fetch matchday')
            })
    },
    loadFeed(cb) {
        axios({
            'url': 'https://api.kickbase.com/v2/leagues/' + store.getters.getLeague + '/feed',
            "method": "GET",
            'params': {
                start: 0,
                filter: '3,5,13,15,16,17'
            }
        })
            .then((response) => {
                if (response.status === 200) {
                    cb(response.data)
                }
            })
            .catch(function () {
                store.commit('setErrorMessage', 'could not fetch feed')
            })
            .finally(function () {
            });
    },
    loadUsersStats(user, loadPlayerStats = true) {
        const tmpUser = user
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/users/' + user.id + '/profile',
            "method": "GET",
        }).then(((profile) => {
            if (profile.data) {
                const userX = Object.assign(tmpUser, profile.data)
                store.commit('addUser', userX)
                api.loadUsersPlayer(userX.id, loadPlayerStats)
            }
        }))
            .catch(function () {
                store.commit('setErrorMessage', 'could not fetch users')
            });
    },
    loadUsersPlayer(userId, loadPlayerStates = true, callback) {
        const user = userId
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/users/' + user + '/players',
            "method": "GET",
        }).then(async (response) => {
            if (response.status === 200) {
                store.commit('addUsersPlayer', {
                    user,
                    players: response.data.players
                })
                if (response.data.players && response.data.players.length && (userId * 1) === store.getters.getSelf && loadPlayerStates === true) {
                    response.data.players.forEach(async (player) => {
                        await api.loadPlayersStats(player.id)
                    })
                }
                if (typeof callback === 'function') {
                    callback()
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
                    store.commit('setErrorMessage', 'You have reached the limit for players of a Bundesliga team (max. ' + store.getters.getSelectedLeague.mpst + ' players)')
                }
            }
            if (typeof errorCb === 'function') {
                errorCb()
            }
        })

    },
    revokeBid(playerId, offerId, callback) {
        const cb = callback
        axios({
            'url': 'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/market/' + playerId + '/offers/' + offerId,
            "method": "DELETE"
        }).then((response) => {
            if (response.status === 200) {
                if (typeof cb === 'function') {
                    cb(response.data)
                }
            }
        })
    },
    checkFailed(then) {
        return function (responses) {
            const someFailed = responses.some(response => response.error)

            if (someFailed) {
                throw responses
            }

            return then(responses)
        }
    },
    putOnMarket(player, callback, multi) {

        store.commit('addLoadingMessage', 'trying to put player "' + player.lastName + '" on market')

        const cb = callback
        let price = player.marketValue + ""

        const getReq = () => {
            return axios.post(
                'https://api.kickbase.com/leagues/' + store.getters.getLeague + '/market',
                {
                    playerId: player.id,
                    price
                }
            )
        }

        const reqs = [
            getReq()
        ]
        if (multi) {
            /*reqs.push(getReq())
            reqs.push(getReq())*/
        }

        axios.all(reqs).then(axios.spread((...responses) => {
            const responseOne = responses[0]
            store.commit('addLoadingMessage', 'put player on market successfully')
            if (responseOne.status === 200) {
                if (typeof cb === 'function') {
                    cb(responseOne)
                }
            }
        })).catch(errors => {
            console.warn(errors)
            store.commit('addErrorLoadingMessage', 'error occured during putting player on market. lets try it again')
            api.putOnMarket(player, cb, multi)
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
    async setPlayerOnMarketAgain(player, callback, loadUsersPlayerOffers = true) {
        store.commit('setLoading', true)
        await api.removePlayerFromMarket(player)
        await sleep(500)
        await api.putOnMarket(player)
        if (loadUsersPlayerOffers) {
            await sleep(500)
            await api.loadUsersPlayerOffers((d) => {
                if (typeof callback === 'function') {
                    callback(d)
                }
            })
        }
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