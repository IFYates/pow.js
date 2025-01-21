import pow from '../src/pow.js'

window.fn = (value) => typeof value == 'function' ? value() : value

const nav = {
    current: location.search?.match(/^\?\/([^\/]+)\/?$/) ? RegExp.$1 : 'home',
    navigate: function (item) {
        this.href = 'javascript:void(0)'
        nav.current = item.id ?? item
        history.pushState(null, null, `?/${nav.current}/`)
        location.hash = item.hash || nav.current
        return false
    },
    isCurrent: (a, b, c) => {
        console.log(this, a, b, c)
        return false
    },

    versions: [
        '3.4',
        '3.3',
        '3.2',
        '3.1',
        '3.0',
        '2.3',
        '2.2',
        '2.1',
        '2.0',
        '1.4',
        '1.3',
        '1.2',
        '1.1',
        '1.0'
    ],

    pages: [
        { id: 'home', name: 'Introduction', icon: 'fas fa-home' },
        { id: 'get-started', name: 'Getting started', icon: 'fas fa-graduation-cap' },
        { id: 'syntax', name: 'Syntax', icon: 'fas fa-code' },
        {
            id: 'bindings',
            name: 'Bindings',
            icon: 'fas fa-link',
            children: [
                { id: 'bindings-data', name: () => activeVersion >= 2.0 ? 'data' : 'item' },
                { id: 'bindings-conditions', name: 'if / ifnot / else' },
                { id: 'bindings-loops', name: 'array' },
                { id: 'bindings-section', name: 'section', visible: () => activeVersion >= 3.3 },
                { id: 'bindings-stop', hash: 'stop', name: 'stop', visible: () => activeVersion >= 1.4 },
                { id: 'bindings-templates', name: 'template', visible: () => activeVersion >= 1.2 },
                { id: 'bindings-transform', name: 'transform', visible: () => activeVersion >= 1.2 },
            ]
        },
        { id: 'attributes', name: 'Attributes', icon: 'fas fa-at' },
        {
            name: 'Features',
            icon: 'fas fa-cogs',
            children: [
                { id: 'features-interaction', name: 'Interactivity' },
                { id: 'features-reactivity', name: 'Reactivity' },
                { id: 'features-custom', name: 'Custom elements', visible: () => activeVersion >= 2.2 },
                { id: 'features-pow-safe', name: 'pow.safe', visible: () => activeVersion >= 1.1 },
            ]
        },
        // {
        //     id: 'examples',
        //     name: 'Examples',
        //     children: [
        //         { id: 'examples-quickstart', name: 'Quickstart' },
        //     ]
        // },
        { id: 'breaking-changes', name: 'Breaking changes', icon: 'fas fa-exclamation-triangle' },
        { id: 'troubleshooting', name: 'Troubleshooting', icon: 'fas fa-bug' },
        { name: 'Repository', url: 'https://github.com/IFYates/pow.js', icon: 'fab fa-github' },
    ]
}

window.activeVersion = nav.versions[0]

const mainBinding = pow.bind(document.getElementsByTagName('main')[0])
const navBinding = pow.apply(document.getElementsByTagName('nav')[0], nav)
pow.apply(document.getElementById('preloader'), nav)
HTMLImportElement.whenInitialised(() => {
    mainBinding.apply(nav)
    const value = location.hash || nav.current
    location.hash = ''
    location.hash = value
})

window.setActiveVersion = function (context) {
    window.activeVersion = context.$data
    mainBinding.refresh()
    navBinding.refresh()
}
window.version = (firstVersion, lastVersion) => activeVersion >= firstVersion && (!lastVersion || activeVersion < lastVersion)

// React to user scrolling
let lastPage = null
window.addEventListener('scroll', () => {
    const pages = [...document.querySelectorAll('main div.page')]
    const topPage = pages.map($ => ({ id: $.id, pos: Math.min(Math.abs($.offsetTop - window.scrollY), Math.abs($.offsetTop + ($.offsetHeight * 0.5) - window.scrollY)) }))
        .reduce((a, b) => a.pos < b.pos ? a : b)

    if (lastPage != topPage?.id) {
        lastPage = topPage?.id
        for (const nav of document.querySelectorAll('.sidebar-link')) {
            nav.classList.toggle('active', nav.id.slice(4) == lastPage)
        }
    }
})