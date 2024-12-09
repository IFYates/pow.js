# pow.js 💥
An extremely small and lightweight templating framework.

> 😲 Under 150 LOCs  
> 📦 ~2.5 KiB minified script  
> ✅ Fully tested

# Goals
* A very small library that can be included without external dependencies
* Provides clear templating and interpolation
* Extensible functionality

# Example
> [See it in action 🏃‍➡️](https://ifyates.github.io/pow.js/examples/quickstart/)
```js
// examples/quickstart/app.js
const data = {
    "url": "https://github.com/IFYates/pow.js",
    "title": "pow.js",
    "description": "An extremely small and lightweight templating framework.",
    "tags": [ "javascript", "templating", "framework" ],
    "creation": {
        "author": "IFYates",
        "date": "2024-12-09"
    }
}

import pow from '../../src/pow.js'
pow.apply(document.body, data)
```
```html
<!-- examples/quickstart/index.html -->
<body>
    <h1>{{ title }}</h1>
    <h2>{{ description }}</h1>
    <p><a href="{{ url }}">See project page</a></p>
    <p pow item="creation">
        Created by <em>{{ author }}</em> on {{ date }}
    </p>
    <p>
        Tags:
        <template pow item="tags" array>
            [<span>{{ $data }}</span>]
            <span ifnot="*last">, </span>
        </template>
    </p>
</body>
```

# Functionality
**_pow💥_** has the following functionality:
* [Interpolation](#interpolations)
  * [With function support](#functions)
  * [And events](#events)
* [Conditional binding](#conditional)
* [Binding loops](#loops)
* [Basic reactivity](#reactivity)

## Interpolations
**_pow💥_** uses mustache-syntax interpolations: `{{ key }}`

In addition to any element of the current object, there are some in-built values:
* `*data`: The entire current object
* `*false`: Constant `false`
* `*first`: If we are [looping](#Looping) through data, `true` when this is the first item
* `*index`: If we are looping through data, the current loop 0-based index
* `*index1`: If we are looping through data, the current loop 1-based index
* `*last`: If we are looping through data, `true` when this is the last item
* `*parent`: The parent object
* `*path`: The current binding path, for debug help
* `*true`: Constant `true`
* `length`: The current array length, but it also works on objects, giving the number of keys

### Functions
Interpolations can be modified registering functions to the prepared binding.  Unregistered functions will result in an empty value.

If the function is registered fully-named, the name does not need to be given explicitly.

**Example:**
```js
function modify(value, data, root) {
    // value: The value of the interpolation
    // data: The current binding context
    // root: The data used in `apply`
    return value + 1
}

const binding = pow.bind(document.body)
binding.register(modify) // Same as: binding.register('modify', modify)
binding.apply({ value: 1 })
```
```html
{{ modify(value) }} <!-- Will show 2 -->
```

### Events
HTML events can be handled by binding the event attribute to a function in the data hierarchy.

**Example:**
```js
const data = {
    handler: function(arg, root) {
        // this: The HTML element that raised the event
        // arg: The current binding context
        // root: The data used in `apply`
    }
}
```
```html
<button onclick="{{ handler }}">Click me</button>
```

## Binding
Any element can be used to control a binding, as long as it has the `pow` attribute.

If the binding element is `template`, it will be replaced in its entirety. Other elements will only have their contents replaced.

The default context will be the `data` provided to the `apply()` function, but the context can be changed by binding to a child element.

**Example:**
```html
<!-- pow.apply(document.body, data) -->
<body><!-- *data = data -->
    <p><!-- *data = data -->
        <template pow item="child"><!-- *data = data -->
            <p><!-- *data = data.child -->
```

### Conditional
**_pow💥_** bindings support a basic set of conditions:
* `if="cond"`, `ifnot="cond"`
* `else-if="cond"`, `else-ifnot="cond"`
* `else`

The `else*` conditions are only evaluated if placed as siblings to a lead `if` template.
```html
<div pow if="*true">Always shown</div> <!-- Not part of following set -->
<div pow if="*true">Always shown; new condition set</div>
<div pow else-if="*true">Only show if prior sibling "if" was false</div>
<div pow else-if="*true">Only show if all prior sibling "if" and "else-if"s were false</div>
<div pow else>Only shown if all prior sibling "if" and "else-if"s were false</div>
```

### Loops
To loop through an item's elements with **_pow💥_**, just bind it as an array.

The bound element will be repeated per element.

**Example:**
```html
<!-- pow.apply(document.body, { list: [1, 2, 3] }) -->
<body>
    <ul>
        <li pow array="list">{{ *data }}</li>
```
```html
<!-- Output -->
<body>
   <ul>
       <li>1</li>
       <li>2</li>
       <li>3</li>
```

If you are already in the array context, omit the binding value to achieve the same effect:
```html
<!-- pow.apply(document.body, { list: [1, 2, 3] }) -->
<body>
    <ul pow item="list">
        <li pow array>{{ *data }}</li>
```

If an object is looped, the keys and values are iterated as `$key` and `$value`.

**Example:**
```html
<!-- pow.apply(document.body, { steps: { first: 1, second: 2, third: 3 } }) -->
<body>
    <div pow array="steps">{{ $key }}: {{ $value }}</div>
```
```html
<!-- Output -->
<body>
    <div>first: 1</div>
    <div>second: 2</div>
    <div>third: 3</div>
```

# Reactivity
**_pow💥_** does not provide true reactivity out-of-the-box, in the aim of keeping the library small.

Some reactivity can be achieved through re-applying bindings:
```js
// examples/reactivity/app.js
import pow from '../../src/pow.js'

const data = { count: 0 }
const binding = pow.apply(document.body, data)
window.increment = () => {
    data.count += 1
    binding.apply(data)
}
```
```html
<!-- examples/reactivity/index.html -->
<body>
    Current value: {{ count }}
    <button click="increment">Add 1</button>
</body>
```
> [See it in action 🏃‍➡️](https://ifyates.github.io/pow.js/examples/reactivity/)