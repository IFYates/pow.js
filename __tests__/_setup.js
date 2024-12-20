beforeEach(() => {
    for (const key of Object.keys(window).filter($ => $.startsWith('$pow_'))) {
        delete window[key]
    }
})

//import pow from '../src/pow.js'
import pow from '../dist/pow.min.js'
global.pow = pow

import { jest } from '@jest/globals'
global.jest = jest