import pow from '../src/pow.js'

const mainBinding = pow.bind(document.getElementById('main'))
window.refreshMain = () => {
    mainBinding.refresh()
    requestAnimationFrame(() => hljs.highlightAll())
}

const nav = {
    current: location.search?.match(/^\?\/([^\/]+)\/?$/) ? RegExp.$1 : 'home',
    navigate: (item) => {
        nav.current = item.key
        history.pushState(null, null, `?/${item.key}/`)
        refreshMain()
    },
    isCurrent: (a, b, c) => {
        console.log(this, a, b, c)
        return false
    },

    items: {
        'home': { icon: document.getElementById('svg-home')?.innerHTML, name: 'Home' },
        'get-started': { name: 'Getting started' },
        'syntax': {
            icon: '',
            name: 'Syntax',
            children: {
                'syntax-binding': { name: 'Bindings' },
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
                'features-conditions': { name: 'Conditions' },
                'features-reactivity': { name: 'Reactivity' },
                'features-pow-safe': { name: 'pow.safe' },
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