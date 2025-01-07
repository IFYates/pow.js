/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 2.3.0
 */

const A_DATA = '$data', A_PARENT = '$parent', A_PATH = '$path', A_ROOT = '$root'
const B_ARRAY = 'array', B_DATA = 'data', B_ELSE = 'else', B_IF = 'if', B_IFNOT = 'ifnot', B_TEMPLATE = 'template'
const ATTR_POW = 'pow', CONTENT = 'content', INN_HTML = 'innerHTML', OUT_HTML = 'outerHTML', REPLACE = 'replace'
const _attribute = {
    set: (element, name, value) => element.setAttribute(name, value),
    remove: (element, name) => element.removeAttribute(name)
}
const _rand = Math.random
const _selectChild = (element, selector) => (element[CONTENT] ?? element).querySelectorAll(selector)

const processElement = (element, state, isRoot, val) => {
    // Interpolates text templates
    const parseText = (text) => escape(text[REPLACE](/{{\s*(.*?)\s*}}/gs, (_, expr) => resolveExpr(expr) ?? ''), isRoot)
    const escape = (text, isRoot) => isRoot ? text : text[REPLACE](/({|p)({|ow)/g, '$1​$2​')

    // Updates the siblings condition
    const processCondition = (active, always) => {
        const updateSiblingCondition = (sibling) => {
            if (sibling?.attributes.pow) {
                for (const { name, value } of sibling.attributes) {
                    if ([B_ELSE + '-' + B_IF, B_ELSE + '-' + B_IFNOT, B_ELSE].includes(name)) {
                        _attribute.remove(sibling, name)
                        // Convert to if/ifnot
                        return active ? !sibling.remove() : name != B_ELSE && _attribute.set(sibling, name.slice(5), value)
                    }
                }
            }
        }
        while (updateSiblingCondition(element.nextElementSibling));
        return (always | !active) && !element.remove()
    }

    // Resolves an expression to a value
    const resolveExpr = (expr, context = getContext(state)) => {
        try {
            // Execute the expression as JS code, mapping to the state data
            const value = pow._eval(expr, context)

            // If the result is a function, bind it for later
            if (typeof value == 'function') {
                const id = _rand()
                window[state.$id][id] = (el) => value.call(el, context)
                return state.$id + '[' + id + '](this)'
            }
            return value
        } catch (e) {
            console.warn('Interpolation failed', { [A_PATH]: state[A_PATH], expr }, e)
        }
    }
    const getContext = (state) => (state[A_PARENT]
        ? { ...state[A_DATA], ...state, [A_PARENT]: getContext(state[A_PARENT]) }
        : { ...state[A_DATA], ...state })

    // Prepare custom elements
    for (const el of [..._selectChild(element, '*')].filter($ => $.tagName.startsWith('POW:'))) {
        el[OUT_HTML] = el[OUT_HTML][REPLACE](/^<pow:([\w-]+)/i, `<${B_TEMPLATE} ${ATTR_POW} ${B_TEMPLATE}="$1"`)
    }

    // Disable child HTML for stopped bindings
    for (const child of _selectChild(element, '*[pow][stop]')) {
        child.replaceWith(document.createRange().createContextualFragment(escape(child[OUT_HTML])))
    }

    _attribute.remove(element, ATTR_POW)

    // Process each attribute in order
    for (const { name, value } of [...element.attributes]) {
        _attribute.remove(element, name)

        // Apply template
        if (name == B_TEMPLATE) {
            val = document.getElementById(value)?.cloneNode(1) || element
            element[INN_HTML] = val[INN_HTML][REPLACE](/<param(?:\s+id=["']([^"']+)["'])?\s*\/?>/g,
                (_, id) => _selectChild(element, B_TEMPLATE + (id ? '#' + id : ''))[0]?.[INN_HTML] ?? '')
            return processElement(element, state)
        }

        // Some logic requires resolved expressions
        val = () => val = (value ? resolveExpr(value) : state[A_DATA])

        if (name[0] == ':') {
            // Interpolated attribute
            if (val()) {
                _attribute.set(element, name.slice(1), val)
            }
            return processElement(element, state)
        } else if (name.at(-1) == ':') {
            // Data attribute
            state = { ...state, [A_DATA]: { ...state[A_DATA], [name.slice(0, -1)]: val() } }
        } else if (name == B_DATA && value) {
            // Data binding
            return val() == null
                ? element.remove()
                : processElement(element, {
                    ...state, [A_PATH]: state[A_PATH] + '.' + value,
                    [A_DATA]: val, [A_PARENT]: state
                }, isRoot)
        } else if (name == B_IF | name == B_IFNOT) {
            // Conditional element
            if (processCondition((name == B_IF) != !val())) {
                return
            }
        } else if (name == B_ARRAY) {
            // Element loop
            val = !val() | Array.isArray(val) ? val
                : Object.entries(val).map(([key, value]) => ({ key, value }))
            for (let i = 0; i < val?.length; ++i) {
                const child = element.cloneNode(1)
                element.parentNode.insertBefore(child, element)
                processElement(child, {
                    ...state, [A_PATH]: state[A_PATH] + (value ? '.' + value : '') + '[' + i + ']', $index: i,
                    $first: !i, $last: i > val.length - 2, [A_DATA]: val[i], $array: val, [A_PARENT]: state
                })
            }
            return processCondition(val?.length, 1)
        } else {
            // Standard attribute
            if (val = parseText(value)) {
                _attribute.set(element, name, val)
            }
        }
    }

    // Process every child 'pow' template
    while (val = _selectChild(element, '*[pow]:not([pow] [pow])')[0]) {
        processElement(val, state)
    }

    // Parse inner HTML
    element[INN_HTML] = parseText(element[INN_HTML])
    if (element.localName == B_TEMPLATE) {
        element.replaceWith(...element[CONTENT].childNodes)
    }
}

const bind = (element) => {
    const originalHTML = element[INN_HTML]
    const attributes = [...element.attributes]
    const $id = '$pow_' + _rand().toString(36).slice(2)
    const binding = {
        apply: (data) => {
            if (binding.$) {
                return console.warn('Binding already in progress')
            }
            binding.$ = 1

            // Reset global state
            element[INN_HTML] = originalHTML
            attributes.forEach($ => _attribute.set(element, $.name, $.value))
            window[$id] = {}

            try {
                processElement(element, { $id, [A_PATH]: A_ROOT, [A_DATA]: data, [A_ROOT]: data }, 1)
            } finally {
                element[INN_HTML] = element[INN_HTML][REPLACE](/​/g, '')
                delete binding.$
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
        return (new Function(...args.map($ => $[0]), 'return ' + expr)).call(ctxt[A_DATA], ...args.map($ => $[1]))
    }
}
export default pow