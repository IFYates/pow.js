import pow from '../src/pow.js'

const mainBinding = pow.bind(document.getElementsByTagName('main')[0])
window.refreshMain = () => {
    mainBinding.refresh()
}

window.fn = (value) => typeof value == 'function' ? value() : value

const nav = {
    current: location.search?.match(/^\?\/([^\/]+)\/?$/) ? RegExp.$1 : 'home',
    navigate: function (item) {
        this.href = 'javascript:void(0)'
        nav.current = item.id ?? item
        history.pushState(null, null, `?/${nav.current}/`)
        refreshMain()
        if (item.hash) {
            location.hash = item.hash
        } else {
            window.scrollTo(0, 0)
        }
        return false
    },
    isCurrent: (a, b, c) => {
        console.log(this, a, b, c)
        return false
    },

    versions: [
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
        { id: 'home', name: 'Home', icon: 'fas fa-home' },
        { id: 'get-started', name: 'Getting started', icon: 'fas fa-graduation-cap' },
        {
            id: 'syntax',
            name: 'Syntax',
            icon: 'fas fa-code',
            children: [
                { id: 'syntax-binding', name: 'Bindings' },
                { id: 'syntax-expressions', name: 'Expressions' },
                { id: 'syntax-attributes', name: 'Attributes' },
            ]
        },
        {
            id: 'bindings',
            name: 'Bindings',
            icon: 'fas fa-link',
            children: [
                { id: 'bindings-loops', name: 'array' },
                { id: 'syntax-binding', hash: 'data', name: () => activeVersion >= 2.0 ? 'data' : 'item' },
                { id: 'bindings-conditions', name: 'if / ifnot / else' },
                { id: 'bindings-templates', name: 'template', visible: () => activeVersion >= 1.2 },
                { id: 'syntax-binding', hash: 'stop', name: 'stop', visible: () => activeVersion >= 1.4 },
            ]
        },
        {
            id: 'features',
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
        { id: 'repo', name: 'Repository', url: 'https://github.com/IFYates/pow.js', icon: 'fab fa-github' },
    ]
}

window.activeVersion = nav.versions[0]

const navBinding = pow.apply(document.getElementsByTagName('nav')[0], nav)
pow.apply(document.getElementById('preloader'), nav)
HTMLImportElement.whenInitialised(() => {
    mainBinding.apply(nav)
    if (location.hash)  {
        const value = location.hash
        location.hash = ''
        location.hash = value
    }
})

window.setActiveVersion = function (context) {
    window.activeVersion = context.$data
    window.refreshMain()
    navBinding.refresh()
}
window.version = (firstVersion, lastVersion) => activeVersion >= firstVersion && (!lastVersion || activeVersion < lastVersion)