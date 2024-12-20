/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 2.0.0
 */

const _attribute = { set: (element, name, value) => element.setAttribute(name, value), remove: (element, name) => element.removeAttribute(name) }
const _rand = Math.random
const _selectChild = (element, selector) => (element.content ?? element).querySelectorAll(selector)
const B_ARRAY = 'array', B_ELSE = 'else', B_IF = 'if', B_IFNOT = 'ifnot', B_ITEM = 'item', B_TEMPLATE = 'template'
const ATTR_POW = 'pow'

// Resolves next pow binding
const consumeBinding = (element, bindings = [B_IF, B_IFNOT, B_TEMPLATE, B_ITEM, B_ARRAY], attr) => {
    if (attr = bindings.find($ => element.hasAttribute($))) {
        const expr = element.getAttribute(attr)
        _attribute.remove(element, attr)
        return { attr, expr }
    }
}

// Interpolates text templates
const parseText = (text, state, isRoot) => escape(text.replace(/{{\s*(.*?)\s*}}/gs, (_, expr) => resolveExpr(expr, state) ?? ''), isRoot)

// Resolves an expression to a value
const resolveExpr = (expr, state) => {
    try {
        // Execute the expression as JS code, mapping to the state data
        const value = pow._eval(expr, { ...state, ...state.$data })

        // If the result is a function, bind it for later
        if (typeof value == 'function') {
            const id = _rand()
            window[state.$id][id] = (el) => value.call(el, state.$data, state.$root)
            return state.$id + '[' + id + '](this)'
        }
        return value
    } catch (e) {
        console.warn('Interpolation failed', { $path: state.$path, expr }, e)
    }
}

// Updates the next sibling condition
const updateSiblingCondition = (sibling, active) => {
    if (sibling?.attributes.pow) {
        const { attr, expr } = consumeBinding(sibling, [B_ELSE + '-' + B_IF, B_ELSE + '-' + B_IFNOT, B_ELSE]) || 0
        if (attr && active) {
            return !sibling.remove()
        } else if (attr && attr != B_ELSE) {
            _attribute.set(sibling, attr.slice(5), expr)
        }
    }
}
const processCondition = (element, active, always) => {
    while (updateSiblingCondition(element.nextElementSibling, active));
    return (always | !active) && element.remove()
}

const escape = (text, isRoot) => isRoot ? text : text.replace(/({|p)({|ow)/g, '$1​$2​')

const processElement = (element, state, isRoot, value) => {
    // Disable child HTML for stopped bindings
    for (const child of _selectChild(element, '*[pow][stop]')) {
        child.replaceWith(document.createRange().createContextualFragment(escape(child.outerHTML)))
    }

    // Process interpolated attributes
    for (let { name, value } of [...element.attributes].filter($ => $.name[0] == ':')) {
        _attribute.remove(element, name)
        if (value = resolveExpr(value, state)) {
            _attribute.set(element, name.slice(1), escape(value, isRoot))
        }
    }

    const { attr, expr } = consumeBinding(element) || 0

    if (attr == B_TEMPLATE) {
        if (value = document.getElementById(expr)) {
            element.innerHTML = value.cloneNode(1).innerHTML
        }
        return processElement(element, state)
    }

    value = expr ? resolveExpr(expr, state) : state.$data
    if (attr == B_IF | attr == B_IFNOT) {
        return processCondition(element, (attr == B_IF) != !value)
    } else if (attr == B_ITEM && expr) {
        if (value == null) {
            return element.remove()
        }
        state = {
            ...state,
            $path: state.$path + '.' + expr,
            $data: value,
            $parent: state.$data
        }
    } else if (attr == B_ARRAY) {
        value = !value | Array.isArray(value) ? value
            : Object.entries(value).map(([key, value]) => ({ key, value }))
        for (let $index = 0; $index < value?.length; ++$index) {
            const child = element.cloneNode(1)
            element.parentNode.insertBefore(child, element)
            processElement(child, {
                ...state,
                $path: state.$path + (expr ? '.' + expr : '') + '[' + $index + ']',
                $index, $first: !$index, $last: $index > value.length - 2,
                $data: value[$index],
                $parent: state
            })
        }
        return processCondition(element, value?.length, 1)
    }

    _attribute.remove(element, ATTR_POW)

    // Process every child 'pow' template
    while (value = _selectChild(element, '*[pow]:not([pow] [pow])')[0]) {
        processElement(value, state)
    }

    // Interpolate literal attributes
    for (let { name, value } of [...element.attributes]) {
        if (value = parseText(value, state, isRoot)) {
            _attribute.set(element, name, value)
        } else {
            _attribute.remove(element, name)
        }
    }

    // Parse inner HTML
    element.innerHTML = parseText(element.innerHTML, state, isRoot)
    if (element.tagName == 'TEMPLATE') {
        element.replaceWith(...element.content.childNodes)
    }
}

const bind = (element) => {
    //element = element.at ? nextChildTemplate(document, element) : element
    const originalHTML = element.innerHTML
    const attributes = [...element.attributes]
    const $id = '$pow_' + _rand().toString(36).slice(2)
    const binding = {
        apply: (data) => {
            if (binding.$pow) {
                return console.warn('Binding already in progress')
            }
            binding.$pow = 1

            // Reset global state
            element.innerHTML = originalHTML
            attributes.forEach($ => _attribute.set(element, $.name, $.value))
            window[$id] = {}

            try {
                processElement(element, { $id, $path: '$root', $data: data, $root: data }, 1)
            } finally {
                element.innerHTML = element.innerHTML.replace(/​/g, '')
                delete binding.$pow
            }

            binding.refresh = () => binding.apply(data)
            return binding
        },
        refresh: () => { }
    }
    return binding
}
const pow = {
    apply: (element, data) => bind(element).apply(data),
    bind,
    _eval: (expr, ctxt) => {
        const args = Object.entries(ctxt).filter($ => isNaN($[0]))
        return (new Function(...args.map($ => $[0]), 'return ' + expr)).call(ctxt.$data, ...args.map($ => $[1]))
    }
}
export default pow