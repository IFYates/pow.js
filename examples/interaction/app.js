import pow from '../../src/pow.js'

var binding
const _data = { count: 0 }
_data.clicked = function (data, root) {
    console.log('Clicked!', /* the clicked element */ this, data, root)
    _data.count += 1
    binding.apply(_data)
}

binding = pow.apply(document.body, _data)