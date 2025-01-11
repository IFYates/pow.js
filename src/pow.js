/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 3.3.0
 */

const ATTR_POW = 'pow', P_DATA = '$data', P_PARENT = '$parent', P_PATH = '$path', P_ROOT = '$root'
const B_ARRAY = 'array', B_DATA = 'data', B_ELSE = 'else', B_IF = 'if', B_IFNOT = 'ifnot'
const B_TEMPLATE = 'template', B_TRANSFORM = 'transform'
const CONTENT = 'content', FUNCTION = 'function', INN_HTML = 'innerHTML'
const OUT_HTML = 'outerHTML', REPLACE = 'replace', REPLACE_WITH = 'replaceWith'

const _attr = { set: (el, name, value) => el.setAttribute(name, value), rem: (el, name) => el.removeAttribute(name) }
const _cloneNode = (el) => el.cloneNode(1)
const _escape = (text, skip) => skip ? text : text[REPLACE](/({|p)({|ow)/g, '$1​$2​')
const _randomId = _ => '_' + Math.random().toString(36).slice(2)
const _replace = (el, html) => el[REPLACE_WITH](document.createRange().createContextualFragment(html)) // TODO: better solution
const _selectChild = (el, selector) => (el[CONTENT] ?? el).querySelectorAll(selector)

const processElement = (element, state, sections, isRoot, _val) => {
    // Interpolates text templates
    const parseText = (text) => _escape(text[REPLACE](/{{\s*(.*?)\s*}}/gs, (_, expr) => parseExpr(expr) ?? ''), isRoot)

    // Allow sibling 'else' based on condition
    const processCondition = (active, alwaysRemove, _sibling = element.nextElementSibling) => {
        if (!active && _sibling?.attributes.pow)
            _attr.rem(_sibling, B_ELSE)
        return (alwaysRemove | !active) && !element.remove()
    }

    // Resolves an expression to a value
    const parseExpr = (expr, raw, _context = getContext(state)) => {
        try {
            // Execute the expression as JS code, mapping to the state data
            const value = pow._eval(expr, _context)

            // If the result is a function, bind it for later
            if (!raw & typeof value == FUNCTION) {
                raw = _randomId()
                window[state.$id][raw] = (el) => value.call(el, _context)
                return `${state.$id}.${raw}(this)`
            }
            return value
        } catch (e) {
            console.warn('Interpolation failed', { [P_PATH]: state[P_PATH], expr }, e)
        }
    }
    const getContext = (state) => ({
        ...state[P_DATA], ...state, [P_PARENT]: state[P_PARENT] && getContext(state[P_PARENT])
    })

    // Prepare custom elements
    for (const el of [..._selectChild(element, '*')].filter($ => $.tagName.startsWith('POW:')))
        _replace(el, el[OUT_HTML][REPLACE](/^<pow:([\w-]+)/i, `<${B_TEMPLATE} ${ATTR_POW} ${B_TEMPLATE}="$1"`))

    // Disable child HTML for stopped bindings
    for (const child of _selectChild(element, '*[pow][stop]'))
        _replace(child, _escape(child[OUT_HTML]))

    _attr.rem(element, ATTR_POW)

    // Process each attribute in order
    let transformFunction = 0
    for (const { name, value } of [...element.attributes]) {
        _attr.rem(element, name)

        // Apply template
        if (name == B_TEMPLATE && !processCondition(_val = document.getElementById(value))) {
            // Gather content data
            let content = {}, defaultContent = null
            for (const child of _selectChild(element, B_TEMPLATE)) {
                defaultContent ??= child[INN_HTML] // Remember first template
                content[child.id] = child[INN_HTML]
            }
            defaultContent ??= element[INN_HTML] // No templates, use whole content

            // Build content with replaced params
            // Has to be a regex on full HTML due to template contents not being in DOM
            element[INN_HTML] = _val[INN_HTML][REPLACE](/<param(?:\s+id=["']([^"']+)["'])?\s*\/?>/g,
                // Find templates by id or default first
                // Default param (no id), takes whole content if there were no templates
                (_, id) => id ? (content[id] || '') : defaultContent)

            return processElement(element, { ...state, $content: content }, sections)
        }

        // Some logic requires resolved expressions
        _val = _ => _val = (value ? parseExpr(value) : state[P_DATA])

        if (name == B_ARRAY) { // Element loop
            _val = !_val() | Array.isArray(_val) ? _val
                : Object.entries(_val).map(([key, value]) => ({ key, value }))
            for (let i = 0; i < _val?.length; ++i) {
                const child = _cloneNode(element)
                element.parentNode.insertBefore(child, element)
                processElement(child, {
                    ...state, [P_PATH]: `${state[P_PATH]}.${value || B_ARRAY}[${i}]`, [P_DATA]: _val[i],
                    [P_PARENT]: state, $index: i, $first: !i, $last: i > _val.length - 2, $array: _val
                }, sections)
            }
            return processCondition(_val?.length, 1)
        } else if (name == B_DATA) { // Data binding
            return processCondition(_val() != null)
                ? 0 // Removed as inactive
                : processElement(element, {
                    ...state, [P_PATH]: state[P_PATH] + '.' + value,
                    [P_DATA]: _val, [P_PARENT]: state
                }, sections, isRoot)
        } else if (name == B_IF | name == B_IFNOT) { // Conditional element
            if (processCondition((name == B_IF) != !_val()))
                return // Removed as inactive
        } else if (name[0] == ':') { // Interpolated attribute
            if (_val())
                _attr.set(element, name.slice(1), _val)
            return processElement(element, state, sections, isRoot)
        } else if (name.at(-1) == ':') { // Data attribute
            state = { ...state, [P_DATA]: { ...state[P_DATA], [name.slice(0, -1)]: _val() } }
        } else if (name == B_ELSE) { // If 'else' survives to here, the element isn't wanted
            return element.remove()
        } else if (name == B_TRANSFORM) { // Transformation function
            transformFunction = parseExpr(value, 1)
        } else if (name == "section" && value) {
            element.id = element.id || _randomId()
            sections[value] = [_cloneNode(element), { ...state }]
        } else if (_val = parseText(value)) { // Standard attribute
            _attr.set(element, name, _val)
        }
    }

    // Process every child 'pow' template
    while (_val = _selectChild(element, '[pow]:not([pow] [pow])')[0])
        processElement(_val, state, sections)

    // Transform complete element
    if (typeof transformFunction == FUNCTION)
        transformFunction(element, state)

    // Parse inner HTML
    element[INN_HTML] = parseText(element[INN_HTML])
    if (element.localName == B_TEMPLATE)
        _replace(element, element[INN_HTML])
}

const bind = (element) => {
    const originalHTML = element[INN_HTML]
    const attributes = [...element.attributes]
    const $id = '$pow' + _randomId()
    const sections = {}

    const _execute = (target, logic, rebinders = {}) => {
        if (binding.$)
            return console.warn('Binding already in progress')
        binding.$ = 1
        try {
            logic()
        } finally {
            target[INN_HTML] = target[INN_HTML][REPLACE](/​/g, '')
            delete binding.$
        }

        for (const [name, [original, state]] of Object.entries(sections)) {
            rebinders[name] = (data) => {
                state[P_DATA] = data ?? state[P_DATA]
                const clone = _cloneNode(original)
                return _execute(clone, _ => {
                    _selectChild(element, '#' + original.id)[0][REPLACE_WITH](clone)
                    processElement(clone, state, sections, 1)
                })
            }
        }
        binding.sections = rebinders

        return binding
    }

    const binding = {
        apply: (data) => _execute(element, _ => {
            // Reset global state
            element[INN_HTML] = originalHTML
            for (const attr of attributes)
                _attr.set(element, attr.name, attr.value)
            window[$id] = {}

            processElement(element, { $id, [P_PATH]: P_ROOT, [P_DATA]: data, [P_ROOT]: data }, sections, 1)

            binding.refresh = _ => binding.apply(data)
        }),
        refresh: _ => { }
    }
    return binding
}

const pow = {
    apply: (element, data) => bind(element).apply(data),
    bind,
    _eval: (expr, ctxt, _args = Object.entries(ctxt).filter($ => isNaN($[0]))) =>
        (new Function(..._args.map($ => $[0]), 'return ' + expr)).call(ctxt[P_DATA], ..._args.map($ => $[1]))
}
export default pow