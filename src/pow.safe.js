/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 1.4.0
 */

import pow from "./pow.js"

/**
 * Provides basic interpolation of values
 * 
 * Supports property walking and 0-argument functions
 */
function _eval(template, data, deep) {
    const period = template.indexOf('.')
    if (period < 0) {
        if (template.endsWith('()')) {
            const fn = _eval(template.slice(0, -2), data, 1)
            return typeof fn == 'function' ? fn(data) : undefined
        }
        return data?.hasOwnProperty(template) ? data[template]
            : template == 'length' && typeof data == 'object' ? Object.keys(data).length
                : !deep ? window[template] : undefined
    }

    const value = _eval(template.slice(0, period), data, 1)
    return _eval(template.slice(period + 1), value, 1)
}
pow._eval = _eval

/**
 * Rebinds event listeners on bound range after each apply
*/
function rebindEvents(element) {
    const attrs = [...element.querySelectorAll('*')].map($ => [...$.attributes]).flat()
        .filter($ => $.name.startsWith('on'))
    for (const { ownerElement, name, value } of attrs) {
        const match = /^\$pow\$\.(\w+)/.exec(value)
        if (match) {
            ownerElement.addEventListener(name.slice(2), () => window.$pow$[match[1]](ownerElement))
            ownerElement.removeAttribute(name)
        }
    }
}
function bind(element) {
    const binding = pow.bind(element)
    const apply = binding.apply
    binding.apply = (data) => {
        const result = apply(data)
        rebindEvents(element)
        return result
    }
    return binding
}

// pow.safe
export default {
    apply: (element, data) => bind(element).apply(data),
    bind,
    _eval
}