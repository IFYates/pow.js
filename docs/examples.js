window.renderExample = function (el, elData, elCode) {
    const elResult = el.nextElementSibling
    if (elResult?.tagName !== 'PRE') {
        return
    }

    let html = el.innerText, data = !elData ? '{}' : `new Function(\`return ${elData.innerText.replace(/'/g, '\\\'')}\`)()`, target = ''
    if (elCode) {
        html = `<body><div id="example">${html}</div>${elCode.innerText}</body>`
        target = '#example'
    }
    if (!html.includes('<body')) {
        html = `<body>${html}</body>`
    }

    let hash = checksum(data + html)
    if (el.getAttribute('hash') == hash) {
        return
    }
    el.setAttribute('hash', hash)

    const id = '$' + Math.random().toString(36).substring(2)
    if (!html.includes('import pow ')) {
        const src = window.activeVersion == 3.0 ? '../src/pow.js' : `https://ifyates.github.io/pow.js/v${window.activeVersion}/pow.min.js`

        html = `<head>
    <script type="module">
        import pow from '${src}'
        try {
            const data = ${data}
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

    if (elResult.nextElementSibling?.classList.contains('example-live')) {
        while (elResult.nextElementSibling.firstChild) {
            elResult.nextElementSibling.removeChild(elResult.nextElementSibling.firstChild)
        }
        elResult.nextElementSibling.appendChild(iframe)
    } else {
        iframe.style.display = 'none'
        document.body.appendChild(iframe)
    }

    iframe.addEventListener('load', () => {
        if (el.getAttribute('hash') != hash) {
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

        if (iframe.style.display) {
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

function checksum(str) {
    return Array.from(str).reduce((a, b) => a + b.charCodeAt(0), 0);
}

const observer = new MutationObserver((ev) => {
    const examples = document.querySelectorAll('main pre.live-example')
    for (const el of examples) {
        const now = new Date().getTime()
        if (el.isConnected) {
            const elData = el.parentElement.querySelector('.example-data')
            const elCode = el.parentElement.querySelector('.example-code')

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