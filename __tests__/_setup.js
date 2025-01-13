beforeEach(() => {
    for (const key of Object.keys(window).filter($ => $.startsWith('$pow_'))) {
        delete window[key]
    }
})

global.pow = (await import(global.module)).default

import { jest } from '@jest/globals'
global.jest = jest