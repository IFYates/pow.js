import pow from '../src/pow.js'

const mainBinding = pow.bind(document.getElementById('main'))
window.refreshMain = () => {
    mainBinding.refresh()
    requestAnimationFrame(() => hljs.highlightAll())
}

const nav = {
    current: location.search?.match(/^\?\/([^\/]+)\/?$/) ? RegExp.$1 : 'home',
    navigate: (item) => {
        nav.current = item.id
        history.pushState(null, null, `?/${item.id}/`)
        refreshMain()
    },
    isCurrent: (a, b, c) => {
        console.log(this, a, b, c)
        return false
    },

    pages: [
        { id: 'home', name: 'Home', icon: '<i class="bi-house-door"></i>' },
        { id: 'get-started', name: 'Getting started' },
        {
            id: 'syntax',
            name: 'Syntax',
            children: [
                { id: 'syntax-binding', name: 'Bindings' },
                { id: 'syntax-expressions', name: 'Expressions' },
                { id: 'syntax-attributes', name: 'Attributes' },
            ]
        },
        {
            id: 'bindings',
            name: 'Bindings',
            children: [
                { id: 'bindings-conditions', name: 'if / ifnot / else' },
                { id: 'bindings-loops', name: 'array' },
                { id: 'bindings-templates', name: 'template' },
            ]
        },
        {
            id: 'features',
            name: 'Features',
            children: [
                { id: 'features-interaction', name: 'Interactivity' },
                { id: 'features-reactivity', name: 'Reactivity' },
                { id: 'features-pow-safe', name: 'pow.safe' },
            ]
        },
        {
            id: 'examples',
            name: 'Examples',
            children: [
                { id: 'quickstart', name: 'Quickstart' },
            ]
        },
        { id: 'repo', name: 'Repository', url: 'https://github.com/IFYates/pow.js' }
    ]
}
console.log(nav.current)

pow.apply(document.getElementById('preloader'), nav)
pow.apply(document.getElementById('nav'), nav)
HTMLImportElement.whenInitialised(() => {
    mainBinding.apply(nav)
    requestAnimationFrame(() => hljs.highlightAll())
})