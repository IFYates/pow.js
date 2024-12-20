import pow from '../src/pow.js'

const mainBinding = pow.bind(document.getElementById('main'))

const nav = {
    current: location.search?.match(/^\?\/([^\/]+)\/?$/) ? RegExp.$1 : 'home',
    navigate: (item) => {
        nav.current = item.key
        history.pushState(null, null, `?/${item.key}/`)
        mainBinding.refresh()
        requestAnimationFrame(() => hljs.highlightAll())
    },
    isCurrent: (a, b, c) => {
        console.log(this, a, b, c)
        return false
    },

    items: {
        'home': { icon: document.getElementById('svg-home')?.innerHTML, name: 'Home' },
        'syntax': {
            icon: '',
            name: 'Syntax',
            children: {
                'syntax-expressions': { name: 'Expressions' },
                'syntax-attributes': { name: 'Attributes' },
                'syntax-templates': { name: 'Templates' },
                'syntax-reactivity': { name: 'Reactivity' },
            }
        },
        'features': {
            icon: '',
            name: 'Features',
            children: {
                'features-attributes': { name: 'Attributes' },
                'features-reactivity': { name: 'Reactivity' },
            }
        },
        'examples': {
            icon: document.getElementById('svg-wrench')?.innerHTML,
            name: 'Examples',
            children: {
                'examples-quickstart': { name: 'Quickstart' },
                'examples-external-data': { name: 'External Data' }
            }
        },
        'repo': { icon: document.getElementById('svg-angles')?.innerHTML, name: 'Repository', url: 'https://github.com/IFYates/pow.js' }
    }
}
console.log(nav.current)

pow.apply(document.getElementById('preloader'), nav)
pow.apply(document.getElementById('nav'), nav)
HTMLImportElement.whenInitialised(() => {
    mainBinding.apply(nav)
    requestAnimationFrame(() => hljs.highlightAll())
})