/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 3.1.0
 */

const ATTR_POW = 'pow', P_DATA = '$data', P_PARENT = '$parent', P_PATH = '$path', P_ROOT = '$root'
const B_ARRAY = 'array', B_DATA = 'data', B_ELSE = 'else', B_IF = 'if', B_IFNOT = 'ifnot'
const B_TEMPLATE = 'template', B_TRANSFORM = 'transform'
const CONTENT = 'content', FUNCTION = 'function', INN_HTML = 'innerHTML', OUT_HTML = 'outerHTML', REPLACE = 'replace'

const _attr = { set: (el, name, value) => el.setAttribute(name, value), rem: (el, name) => el.removeAttribute(name) }
const _escape = (text, asRoot) => asRoot ? text : text[REPLACE](/({|p)({|ow)/g, '$1​$2​')
const _rand = Math.random
const _selectChild = (el, selector) => (el[CONTENT] ?? el).querySelectorAll(selector)

const processElement = (element, state, isRoot, val) => {
    // Interpolates text templates
    const parseText = (text) => _escape(text[REPLACE](/{{\s*(.*?)\s*}}/gs, (_, expr) => parseExpr(expr) ?? ''), isRoot)

    // Allow sibling 'else' based on condition
    const processCondition = (active, alwaysRemove, sibling = element.nextElementSibling) => {
        if (!active && sibling?.attributes.pow)
            _attr.rem(sibling, B_ELSE)
        return (alwaysRemove | !active) && !element.remove()
    }

    // Resolves an expression to a value
    const parseExpr = (expr, raw, context = getContext(state)) => {
        try {
            // Execute the expression as JS code, mapping to the state data
            const value = pow._eval(expr, context)

            // If the result is a function, bind it for later
            if (!raw & typeof value == FUNCTION) {
                const id = _rand()
                window[state.$id][id] = (el) => value.call(el, context)
                return state.$id + '[' + id + '](this)'
            }
            return value
        } catch (e) {
            console.warn('Interpolation failed', { [P_PATH]: state[P_PATH], expr }, e)
        }
    }
    const getContext = (state) => (state[P_PARENT]
        ? { ...state[P_DATA], ...state, [P_PARENT]: getContext(state[P_PARENT]) }
        : { ...state[P_DATA], ...state })

    // Prepare custom elements
    for (const el of [..._selectChild(element, '*')].filter($ => $.tagName.startsWith('POW:')))
        el[OUT_HTML] = el[OUT_HTML][REPLACE](/^<pow:([\w-]+)/i, `<${B_TEMPLATE} ${ATTR_POW} ${B_TEMPLATE}="$1"`)

    // Disable child HTML for stopped bindings
    for (const child of _selectChild(element, '*[pow][stop]'))
        child.replaceWith(document.createRange().createContextualFragment(_escape(child[OUT_HTML])))

    _attr.rem(element, ATTR_POW)

    // Process each attribute in order
    let transformFunction = 0
    for (const { name, value } of [...element.attributes]) {
        _attr.rem(element, name)

        // Apply template
        if (name == B_TEMPLATE && !processCondition(val = document.getElementById(value)?.cloneNode(1))) {
            element[INN_HTML] = val[INN_HTML][REPLACE](/<param(?:\s+id=["']([^"']+)["'])?\s*\/?>/g,
                // Find first child template or by id
                (_, id) => _selectChild(element, B_TEMPLATE + (id ? '#' + id : ''))[0]?.[INN_HTML]
                    // No child template for default param, take whole content
                    ?? (id ? '' : element[INN_HTML]))
            return processElement(element, state)
        }

        // Some logic requires resolved expressions
        val = () => val = (value ? parseExpr(value) : state[P_DATA])

        if (name[0] == ':') { // Interpolated attribute
            if (val())
                _attr.set(element, name.slice(1), val)
            return processElement(element, state)
        } else if (name.at(-1) == ':') { // Data attribute
            state = { ...state, [P_DATA]: { ...state[P_DATA], [name.slice(0, -1)]: val() } }
        } else if (name == B_DATA && value) { // Data binding
            return processCondition(val() != null)
                ? 0 // Removed as inactive
                : processElement(element, {
                    ...state, [P_PATH]: state[P_PATH] + '.' + value,
                    [P_DATA]: val, [P_PARENT]: state
                }, isRoot)
        } else if (name == B_IF | name == B_IFNOT) { // Conditional element
            if (processCondition((name == B_IF) != !val()))
                return // Removed as inactive
        } else if (name == B_ELSE) { // If 'else' survives to here, the element isn't wanted
            return element.remove()
        } else if (name == B_ARRAY) { // Element loop
            val = !val() | Array.isArray(val) ? val
                : Object.entries(val).map(([key, value]) => ({ key, value }))
            for (let i = 0; i < val?.length; ++i) {
                const child = element.cloneNode(1)
                element.parentNode.insertBefore(child, element)
                processElement(child, {
                    ...state, [P_PATH]: state[P_PATH] + (value ? '.' + value : '') + '[' + i + ']', $index: i,
                    $first: !i, $last: i > val.length - 2, [P_DATA]: val[i], $array: val, [P_PARENT]: state
                })
            }
            return processCondition(val?.length, 1)
        } else if (name == B_TRANSFORM) { // Transformation function
            transformFunction = parseExpr(value, 1)
        } else if (val = parseText(value)) { // Standard attribute
            _attr.set(element, name, val)
        }
    }

    // Process every child 'pow' template
    while (val = _selectChild(element, '*[pow]:not([pow] [pow])')[0])
        processElement(val, state)

    // Transform complete element
    if (typeof transformFunction == FUNCTION)
        transformFunction(element, state)

    // Parse inner HTML
    element[INN_HTML] = parseText(element[INN_HTML])
    if (element.localName == B_TEMPLATE)
        element.replaceWith(...element[CONTENT].childNodes)
}

const bind = (element) => {
    const originalHTML = element[INN_HTML]
    const attributes = [...element.attributes]
    const $id = '$pow_' + _rand().toString(36).slice(2)
    const binding = {
        apply: (data) => {
            if (binding.$)
                return console.warn('Binding already in progress')
            binding.$ = 1

            // Reset global state
            element[INN_HTML] = originalHTML
            attributes.forEach($ => _attr.set(element, $.name, $.value))
            window[$id] = {}

            try {
                processElement(element, { $id, [P_PATH]: P_ROOT, [P_DATA]: data, [P_ROOT]: data }, 1)
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
    _eval: (expr, ctxt, args = Object.entries(ctxt).filter($ => isNaN($[0]))) =>
        (new Function(...args.map($ => $[0]), 'return ' + expr)).call(ctxt[P_DATA], ...args.map($ => $[1]))
}
export default pow