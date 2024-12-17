# pow.js 💥
An extremely small and lightweight templating framework.

[![NPM Version](https://img.shields.io/npm/v/pow-templating)](https://www.npmjs.com/package/pow-templating)

> 😲 Only 130 LOCs!  
> 🤏 <2.25 KiB minified script (+ header)  
> 🧩 No other dependencies  
> ✅ [100% test coverage](https://ifyates.github.io/pow.js/coverage/lcov-report)

# Goals
* A very small library that can be included without additional dependencies
* Provides clear templating and interpolation
* Extensible functionality

# Functionality
**_pow💥_** has the following functionality:
* [Interpolation](#interpolations)
  * [With function support](#functions)
  * [And events](#events)
* [Conditional binding](#conditional)
* [Repeated sections](#loops)
* [Reusable templates](#reusable)
* [Basic reactivity](#reactivity)

# Installation
Get [npm module](https://www.npmjs.com/package/pow-templating) or import directly from any javascript module:
```js
import pow from 'https://ifyates.github.io/pow.js/latest/pow.min.js'
```

Looking at CDN hosting soon.

# Example
> [See it in action 🏃‍➡️](https://ifyates.github.io/pow.js/examples/quickstart.html)
```html
// examples/quickstart.html
<script type="module">
    import pow from '../src/pow.js'

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
    pow.apply(document.body, data)
</script>
<body>
    <h1>{{ title }}</h1>
    <h2>{{ description }}</h1>
    <p><a href="{{ url }}">See project page</a></p>
    <p pow item="creation">
        Created by <em>{{ author }}</em> on {{ date }}
    </p>
    <p>
        Tags:
        <template pow array="tags">
            [<span>{{ *data }}</span>]<span ifnot="*last">, </span>
        </template>
    </p>
</body>
```

> [Fiddle with it ✏️](https://jsfiddle.net/IFYates/s13m7ptf/1/)
<iframe width="100%" height="300" src="//jsfiddle.net/IFYates/s13m7ptf/1/embedded/js,html,result/dark/" frameborder="0" loading="lazy" allowtransparency="true" allowfullscreen="true"></iframe>

# Guide

## Interpolations
**_pow💥_** uses mustache-syntax interpolations (`{{ key }}`) and supports deep attributes (`{{ child.key }}`).

Interpolations can make use of complex expressions, but must start with a variable or function reference.

It is important to be aware that values are not made HTML-safe, so any HTML tags will be inserted verbatim.

In addition to any attribute of the current object, there are some in-built values:
* `*data`: The entire current object
* `*parent`: The parent object
* `*path`: The current binding path, for debug help
* `*root`: The data passed to the `apply` call
* If we are [looping](#loops) through data:
  * `*first`: `true` when this is the first item
  * `*index`: The 0-based index of the current item
  * `*last`: `true` when this is the last item

### Functions
Interpolations can make use of functions registered on the bound data hierarchy.

The simplest way to access a function is to invoke them from the global scope.

**Example:**
```html
<!-- examples/functions-global.html -->
<script type="module">
    import pow from '../src/pow.js'

    const data = {
        text: 'this is my text'
    }
    pow.apply(document.body, data)
</script>
<script>
    // Global function
    function wordCount(str) {
        return str.split(' ').length
    }
</script>
<body>
    "{{ text }}" contains {{ wordCount(text) }} words
</body>
```
> [See it in action 🏃‍➡️](https://ifyates.github.io/pow.js/examples/functions-global.html)

Functions can also be provided as part of the data hierarchy.

**Example:**
```html
<!-- examples/functions-data.html -->
<script type="module">
    import pow from '../src/pow.js'

    const data = {
        text: 'this is my text',
        wordCount: (str) => str.split(' ').length
    }
    pow.apply(document.body, data)
</script>
<body>
    "{{ text }}" contains {{ *root.wordCount(text) }} words
</body>
```
> [See it in action 🏃‍➡️](https://ifyates.github.io/pow.js/examples/functions-data.html)

### Events
HTML events can be handled by binding the event attribute to a function in the data hierarchy.

**Example:**
```html
<!-- examples/interaction.html -->
<script type="module">
    const data = {
        handler: function(arg, root) {
            console.log('Clicked!',
                this, // The HTML element that raised the event
                arg, // The current binding context
                root // The data used in `apply`
            )
        }
    }
</script>
<body>
    <button onclick="{{ handler }}">Click me</button>
</body>
```
> [See it in action 🏃‍➡️](https://ifyates.github.io/pow.js/examples/interaction.html)

### Interpolation logic
`v1.1.0`
By default, **_pow💥_** provides full Javascript logic for interpolation using dynamic functions.  
Some environment block dynamic code evaluation for user security.

In these situations, the interpolation logic can be replaced to allow for a custom parser to be used that meets any security requirements of the environment.

The logic is specified by providing a new `pow._eval` function, where it takes 2 arguments: the string to be parsed and the current context data.

**Example:**
```html
<script type="module">
pow._eval = (js, args) => {
    // js: 'child.text'
    // args: { child: { text: "my value" } }
}
pow.apply(document.body, {
    child: { text: "my value" }
})
</script>
<body>
    {{ child.text }}
</body>
```

The [`pow.safe.js`](src/pow.safe.js) file is provided with a suggested alternative parser with some basic capabilities.

## Bindings
Any element can be used to control a binding, as long as it has the `pow` attribute.

If the binding element is a `template`, it will be replaced in its entirety. Other elements will only have their contents replaced.

The default context will be the `data` provided to the `apply()` function, but the context can be changed by binding to a child element.

**Example:**
```html
<!-- pow.apply(document.body, data) -->
<body><!-- *data = data -->
    <p><!-- *data = data -->
        <template pow item="child"><!-- *data = data.child -->
            <p><!-- *data = data.child -->
```

### Conditional
**_pow💥_** bindings support a basic set of conditions:
* `if="cond"`, `ifnot="cond"`
* `else-if="cond"`, `else-ifnot="cond"`
* `else`

The `else*` conditions are only evaluated if placed as siblings to a lead `if` template.
```html
<div pow if="cond">Always shown</div> <!-- Not part of following set -->
<div pow if="cond">Always shown; new condition set</div>
<div pow else-if="cond">Only show if prior sibling "if" was false</div>
<div pow else-if="cond">Only show if all prior sibling "if" and "else-if"s were false</div>
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

#### Objects
If an object is looped, the keys and values are iterated as `key` and `value`.

**Example:**
```html
<!-- pow.apply(document.body, { steps: { first: 1, second: 2, third: 3 } }) -->
<body>
    <div pow array="steps">{{ key }}: {{ value }}</div>
```
```html
<!-- Output -->
<body>
    <div>first: 1</div>
    <div>second: 2</div>
    <div>third: 3</div>
```

#### Post-loop conditions
`v1.2.0`
The `else` logic can be applied to loops, used when the loop does not produce an output.

**Example:**
```html
<!-- pow.apply(document.body, { list: [] }) -->
<body>
    <div pow array="list">{{ *data }}</div>
    <div pow else>This is nothing in your list</div>
```

### Reusable templates
`v1.2.0` If you have a particularly complex template, **_pow💥_** can insert a copy of it using the `template` binding, replacing the bound element.  
Although this can be applied to any element, it is recommended to use `source` as this is a self-closing tag that cannot have any contents.

The `item`/`array` bindings can be used to specify what data the template receives.

Note: Reusable templates should always be stored outside of any bound elements, otherwise they will be modified like anything else.

**Example:**
```html
<!-- pow.apply(document.body, { list: [ 1, 2, 3, 4, 5 ] }) -->
<body>
    <source pow array="list" template="example" />
</body>
<template id="example">{{ *data }}, </template>
```
```html
<!-- Output -->
<body>
    1, 2, 3, 4, 5, 
</body>
<template id="example">{{ *data }}, </template>
```

# Reactivity
**_pow💥_** does not provide true reactivity out-of-the-box, in the aim of keeping the library small.

Some reactivity can be achieved through re-applying or refreshing a binding. Note that this does destroy the elements, so any code referencing the output will need to be reapplied.

**Example:**
```html
<!-- examples/reactivity/index.html -->
<script type="module">
    import pow from '../src/pow.js'

    const binding = pow.bind(document.body)
    const data = {
        count: 0,
        increment: () => {
            data.count += 1
            binding.refresh()
        }
    }
    binding.apply(data)
</script>
<body>
    Current value: {{ count }}
    <button onclick="{{ increment }}">Add 1</button>
</body>
```
> [See it in action 🏃‍➡️](https://ifyates.github.io/pow.js/examples/reactivity.html)

# Troubleshooting

## Malformed HTML
Since the templating is applied to the DOM structure, malformed HTML may cause what appears to be unexpected behaviour.  
The `*path` interpolation is intended to help in these situations.

A particularly common mistake is not closing tags correctly or incorrect nestings (e.g., `div` tags cannot be inside `p` tags).

**Example:**
```html
{{* path }}<!-- '*root' -->
<p pow item="list">
    {{* path }}<!-- '*root.list' -->
    <div pow array><!-- 'div' element cannot be inside a 'p' and will be shifted outside -->
        {{* path }}<!-- '*root' -->
    </div>
</p>
```

# Possible future features
* Attributes
    * Dynamic attributes: Adding an attribute based on interpolation (with conditions)
    * Aggregating attributes: Adding a dynamic value to a static attribute (e.g., `class`)
    * Possible syntax: `<param pow (if?) name="interpolated" mode="create|replace|append" value="interpolated" />`
* Prevent recursive parsing?
    * Example: `data: { text: '[{{ value }}]', value: 1 }`
* Switch statement
   ```html
   <template pow switch="token">
       <div case="{{ token }}">...</div>
       <div case="literal">...</div>
   </template>
   ```