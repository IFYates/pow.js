import pow from '../../src/pow.js'
        
const data = { count: 0 }
const binding = pow.apply(document.getElementById('main'), data)
window.increment = () => {
    data.count += 1
    binding.apply(data)
}