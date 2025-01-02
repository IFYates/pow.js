/**
 * Import an HTML file into the document.
 * Executes imported script elements.
 * 
 * Attributes:
 *   src: URL of the HTML file
 *   replace: If exists, replaces the 'html-import' element with the imported content
 * 
 * Methods:
 *   onCompleted(callback)
 */
class HTMLImportElement extends HTMLElement {
    static #docLoaded = document.readyState == 'complete'
    static #found = 0
    static #done = 0
    static #eventSent = false
    static get complete() { return HTMLImportElement.#docLoaded && HTMLImportElement.#found == HTMLImportElement.#done }

    static {
        if (!HTMLImportElement.#docLoaded) {
            addEventListener("DOMContentLoaded", _ => {
                HTMLImportElement.#docLoaded = true
            })
        }
    }

    constructor() {
        super()
        ++HTMLImportElement.#found
        requestAnimationFrame(this.#mounted.bind(this))
    }

    #mounted() {
        const self = this
        if (!self.attributes.src) {
            self.#loaded()
            return
        }

        // TODO: what to show if not 2xx?
        console.debug('html-import', 'importing', self.attributes.src.value)
        fetch(self.attributes.src.value)
            .then(async r => {
                self.innerHTML = await r.text()
                const scripts = self.querySelectorAll('script')
                if (self.hasAttribute('replace')) {
                    self.replaceWith(...self.childNodes)
                }
                
                // Force imported scripts to load
                scripts.forEach((src) => {
                    const script = document.createElement('script')
                    for (const attr of src.attributes) {
                        script[attr.name] = attr.value
                    }
                    script.innerHTML = src.innerHTML
                    requestAnimationFrame(() => document.head.appendChild(script))
                })

                self.#loaded()
            })
            .catch(e => {
                console.error('Failed to import HTML: ' + self.attributes.src.value, e)
                self.remove()
                self.#loaded()
            })
    }

    #isLoaded = false
    #loaded() {
        ++HTMLImportElement.#done
        this.#isLoaded = true
        this.#loadedSubscribers?.forEach(s => s())
        this.#loadedSubscribers = null
        if (!HTMLImportElement.#eventSent && HTMLImportElement.complete) {
            HTMLImportElement.#eventSent = true
            console.debug('HTMLImportElement.complete')
            document.dispatchEvent(new Event('htmlImportComplete', { bubbles: true }))
        }
    }

    /**
     * Registers a callback to be executed when this HTML import is complete.
     * If the import process is already complete, the callback is invoked immediately.
     * Otherwise, it waits for the import to complete.
     *
     * @param {Function} callback - The function to be called upon completion of the HTML import.
     */
    whenLoaded(callback) {
        if (this.#isLoaded) {
            callback()
        } else {
            this.#loadedSubscribers.push(callback)
        }
    }
    #loadedSubscribers = []

    /**
     * Registers a callback to be executed when all initial HTML imports are complete.
     * If the import process is already complete, the callback is invoked immediately.
     * Otherwise, it waits for the 'htmlImportComplete' event to trigger the callback.
     *
     * @param {Function} callback - The function to be called upon completion of the HTML import.
     */
    static whenInitialised(callback) {
        if (HTMLImportElement.complete) {
            callback()
        } else {
            HTMLImportElement.#eventSent = false
            addEventListener('htmlImportComplete', callback)
        }
    }
}

customElements.define('html-import', HTMLImportElement)
globalThis.HTMLImportElement = HTMLImportElement