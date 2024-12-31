import pow from '../src/pow.js'

const mainBinding = pow.bind(document.getElementsByTagName('main')[0])
window.refreshMain = () => {
    mainBinding.refresh()
    //requestAnimationFrame(() => hljs.highlightAll())
    // TODO: scroll to top
}

window.activeVersion = 2.0
window.setActiveVersion = function(context) {
    window.activeVersion = context.$data
    window.refreshMain()
}
window.version = (firstVersion, lastVersion) => activeVersion >= firstVersion && (!lastVersion || activeVersion < lastVersion)

const nav = {
    current: location.search?.match(/^\?\/([^\/]+)\/?$/) ? RegExp.$1 : 'home',
    navigate: function (item) {
        this.href = 'javascript:void(0)'
        nav.current = item.id
        history.pushState(null, null, `?/${item.id}/`)
        refreshMain()
        return false
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
                { id: 'bindings-loops', name: 'array' },
                { id: 'bindings-data', name: 'data / item', url: '?/syntax-binding/#data' },
                { id: 'bindings-conditions', name: 'if / ifnot / else' },
                { id: 'bindings-stop', name: 'stop', url: '?/syntax-binding/#stop' },
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
                { id: 'examples-quickstart', name: 'Quickstart' },
            ]
        },
        { id: 'breaking-changes', name: 'Breaking changes' },
        { id: 'troubleshooting', name: 'Troubleshooting' },
        { id: 'repo', name: 'Repository', url: 'https://github.com/IFYates/pow.js' }
    ]
}
console.log(nav.current)

pow.apply(document.getElementsByTagName('nav')[0], nav)
pow.apply(document.getElementById('preloader'), nav)
HTMLImportElement.whenInitialised(() => {
    mainBinding.apply(nav)
    // requestAnimationFrame(() => hljs.highlightAll())
})