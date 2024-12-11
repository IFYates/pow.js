import pow from '../../src/pow.js'
pow.apply(document.body, {
    text: new Date(),
    child: {
        text: 'Hello, world!',
        values: [ 1, 2, 3, 4, 5 ]
    }
})