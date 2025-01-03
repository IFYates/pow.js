window.renderExample = function (el, elData, elCode) {
    const elResult = el.nextElementSibling
    if (elResult?.tagName !== 'PRE') {
        return
    }

    if (el.hasAttribute('state')) {
        el.setAttribute('state', 'dirty')
        return
    }
    el.setAttribute('state', 'run')

    let ver = window.activeVersion
    const id = '$' + Math.random().toString(36).substring(2)
    if ([...ver].filter($ => $ == '.').length < 2) {
        ver = `${ver}.0`
    }

    let html = el.innerText, target = ''
    if (elCode) {
        html = `<body><div id="example">${html}</div>${elCode.innerText}</body>`
        target = '#example'
    }
    if (!html.includes('<body')) {
        html = `<body>${html}</body>`
    }
    if (!html.includes('import pow ')) {
        html = `<head>
    <script type="module">
        import pow from 'https://ifyates.github.io/pow.js/v${ver}/pow.min.js'
        try {
            const data = ${!elData ? '{}' : `new Function('return ${elData.innerText.replace(/'/g, '\\\'')}')()`}
            pow.apply(${target ? 'document.querySelector(\'' + target + '\')' : 'document.body'}, data)
        } catch (e) {
            parent['${id}'] = e
        }
    </script>
</head>${html}`
    }

    const iframe = document.createElement('iframe')
    const doc = new DOMParser().parseFromString(html, 'text/html')
    iframe.srcdoc = doc.documentElement.outerHTML
    iframe.style.display = 'none'
    document.body.appendChild(iframe)
    iframe.addEventListener('load', () => {
        if (!el.hasAttribute('state')) {
            return
        }
        if (window[id]) {
            el.removeAttribute('state')
            elResult.innerHTML = '<div class="error">Error: ' + window[id] + '</div>'
            delete window[id]
            return
        }

        const result = iframe.contentDocument.documentElement.querySelector(target || 'body')
        const html = el.innerText.includes('<body') ? result.outerHTML : result.innerHTML
        elResult.innerHTML = html.trim().replace(/</g, '&lt;')
            .replace(/=""(?=[ >])/g, '')
            .replace(/>/g, '&gt;')

        if (elResult.nextElementSibling?.classList.contains('example-live')) {
            while (elResult.nextElementSibling.firstChild) {
                elResult.nextElementSibling.removeChild(elResult.nextElementSibling.firstChild)
            }
            elResult.nextElementSibling.appendChild(iframe)
            iframe.style.display = ''
        } else {
            iframe.remove()
        }

        if (el.getAttribute('state') == 'dirty') {
            el.removeAttribute('state')
            renderExample(el, elData, elCode)
        } else {
            el.removeAttribute('state')
        }
    })
}

const observer = new MutationObserver(() => {
    const examples = document.querySelectorAll('main pre.live-example')
    for (const el of examples) {
        const now = new Date().getTime()
        if (el.isConnected && (!el.hasAttribute('r') || el.getAttribute('r') < now)) {
            el.setAttribute('r', now + 1000)
            const elData = el.parentElement.querySelector('pre.example-data')
            const elCode = el.parentElement.querySelector('pre.example-code')
            const fn = () => renderExample(el, elData, elCode)
            el.addEventListener('keyup', fn)
            elData?.addEventListener('keyup', fn)
            elCode?.addEventListener('keyup', fn)
            fn()
        }
    }
})
observer.observe(document.getElementsByTagName('main')[0], {
    childList: true,
    subtree: true
})