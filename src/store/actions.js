function setAppIsInitialized(context) {
    context.commit('setInitialized', true)
}

export default {
    setAsInitialized: setAppIsInitialized,
}