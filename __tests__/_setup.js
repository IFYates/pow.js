beforeEach(() => {
    for (const key of Object.keys(window).filter($ => $.startsWith('$pow_'))) {
        delete window[key]
    }
})