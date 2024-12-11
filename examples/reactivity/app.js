import pow from '../../src/pow.js'

const binding = pow.bind(document.body)
const data = {
    count: 0,
    increment: () => {
        data.count += 1
        binding.apply(data)
    }
}
binding.apply(data)