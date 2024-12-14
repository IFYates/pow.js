/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 1.1.0
 */

function consumeBinding(element, bindings = ['item', 'array', 'if', 'ifnot']) {
    for (const attr of bindings) {
        const token = element.getAttribute(attr)
        if (token != null) {
            element.removeAttribute(attr)
            return { attr, token }
        }
    }
    return {}
}

const _regex = /\{\{\s*(.*?)\s*\}\}/s
function parseText(text, state, match) {
    while (match = _regex.exec(text)) {
        const value = resolveToken(match[1], state) ?? ''
        _regex.lastIndex = match.index + `${value}`.length
        text = text.slice(0, match.index) + value + text.slice(match.index + match[0].length)
    }
    return text
}

function resolveToken(token, state, js = token) {
    try {
        // If the token starts with a star, it's accessing the state metadata
        const args = (token[0] == '*' && (js = token.slice(1))) ? state : state?.data

        // Execute the token as JS code, mapping to the state data
        const value = pow._eval(js, args)

        // If the result is a function, bind it for later
        if (typeof value == 'function') {
            const uufn = `_${Math.random().toString(36).slice(2)}`
            window.$pow$[uufn] = (el) => value.call(el, state.data, state.root)
            return `$pow$.${uufn}(this)`
        }
        return value
    } catch (e) {
        console.warn('Interpolation failed', { '*path': state.path, token }, e)
    }
}

function updateSiblingCondition(sibling, value) {
    if (sibling?.attributes.pow) {
        const { attr, token } = consumeBinding(sibling, ['else-if', 'else-ifnot', 'else'])
        if (attr && value) {
            sibling.remove()
            return true
        }
        if (attr && attr != 'else') {
            sibling.setAttribute(attr.slice(5), token)
        }
    }
}

const nextChildTemplate = (element) => (element.content ?? element).querySelector('*[pow]:not([pow] [pow])')

function processElement(element, state) {
    const { attr, token } = consumeBinding(element)
    const value = token ? resolveToken(token, state) : state.data
    if (attr == 'if' || attr == 'ifnot') {
        while (updateSiblingCondition(element.nextElementSibling, (attr == 'if') != !value));
        if ((attr == 'if') == !value) {
            return element.remove()
        }
    } else if (attr == 'item' && token) {
        state = {
            ...state,
            path: `${state.path}.${token}`,
            data: value,
            parent: state.data
        }
    } else if (attr == 'array' && typeof value == 'object') {
        const array = Array.isArray(value) ? value
            : Object.entries(value).map(([k, v]) => ({ key: k, value: v }))
        for (let index = 0; index < array.length; ++index) {
            const child = element.cloneNode(1)
            element.parentNode.insertBefore(child, element)
            processElement(child, {
                ...state,
                path: `${state.path}${token ? `.${token}` : ''}[${index}]`,
                index, first: !index, last: index > array.length - 2,
                data: array[index],
                parent: state
            })
        }
        return element.remove()
    }

    element.removeAttribute('pow')

    // Process every child 'pow' template
    var childTemplate
    while (childTemplate = nextChildTemplate(element)) {
        processElement(childTemplate, state)
    }

    // Interpolate attributes
    for (const { name, value } of element.attributes) {
        element.setAttribute(name, parseText(value, state))
    }

    // Parse inner HTML
    const html = parseText(element.innerHTML, state)
    if (element instanceof HTMLTemplateElement) {
        element.insertAdjacentHTML('afterend', html)
        element.remove()
    } else {
        element.innerHTML = html
    }
}

function bind(element) {
    const originalHTML = element.innerHTML
    const attributes = [...element.attributes]
    const binding = {
        apply: (data) => {
            if (binding.$pow) {
                return console.warn('Binding already in progress')
            }
            binding.$pow = 1
            window.$pow$ = {}
            element.innerHTML = originalHTML
            for (const { name, value } of attributes) {
                element.setAttribute(name, value)
            }
            processElement(element, { path: '*root', data, root: data })
            delete binding.$pow
            binding.refresh = () => binding.apply(data)
            return binding
        },
        refresh: () => { }
    }
    return binding
}
const pow = {
    apply(element, data) {
        return bind(element).apply(data)
    },
    bind,
    _eval: (js, data) => {
        data = Object.entries(data || {}).filter($ => isNaN($[0]))
        return (new Function(...data.map($ => $[0]), `return ${js}`))(...data.map($ => $[1]))
    }
}
export default pow