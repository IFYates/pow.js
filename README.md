# pow.js 💥
An extremely small and lightweight templating framework.

[![NPM Version](https://img.shields.io/npm/v/pow-templating)](https://www.npmjs.com/package/pow-templating)
![pow.min.js file size in bytes](https://img.shields.io/github/size/IFYates/pow.js/dist%2Fpow.min.js?label=pow.min.js)


> 😲 Only 140 LOCs!  
> 🤏 <2&frac12; KiB minified script (+ header)  
> 🧩 No other dependencies  
> ✅ [100% test coverage](https://ifyates.github.io/pow.js/coverage/lcov-report)

# Goals
* A very small library that can be included without additional dependencies
* Provides clear templating and interpolation
* Extensible functionality through function calling and templates

# Functionality
**_pow💥_** has the following functionality:
* [Interpolation](#interpolations)
  * [With function support](#functions)
  * [And events](#events)
* [Dynamic attributes](#attributes-v140)
* [Conditional binding](#conditional)
* [Repeated sections](#loops)
* [Reusable templates](#reusable-templates-v120)
* [Basic reactivity](#reactivity)

# Installation
Get the [npm module](https://www.npmjs.com/package/pow-templating) or import directly from any javascript module:
```js
import pow from 'https://ifyates.github.io/pow.js/latest/pow.min.js'
```

Looking at CDN hosting soon.

# Example
> [See it in action 🏃‍➡️](https://jsfiddle.net/IFYates/qtngjxbu/)
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
    <h2>{{ description }}</h2>
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

# Guide

## Interpolations
**_pow💥_** uses mustache-syntax interpolations (`{{ key }}`) and supports deep attributes (`{{ child.key }}`).

Interpolations can make use of complex expressions, but must start with a variable or function reference.

It is important to be aware that values are not made HTML-safe, so any HTML tags will be inserted verbatim.

In addition to any attribute of the current object, there are some in-built values:
* `*data`: The entire current object
* `*parent`: The parent object
* `*path`: The current binding path, for debug help
* `*root`: The data passed to the `apply()` call
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
                root // The data used in `apply()`
            )
        }
    }
</script>
<body>
    <button onclick="{{ handler }}">Click me</button>
</body>
```
> [See it in action 🏃‍➡️](https://ifyates.github.io/pow.js/examples/interaction.html)

### Interpolation logic and pow.safe <small><sup>`v1.1.0`</sup></small>
By default, **_pow💥_** provides full Javascript logic for interpolation using dynamic functions.  
Some environments block dynamic code evaluation for user security.

In these situations, the interpolation logic can be replaced to allow for a custom parser to be used that meets any security requirements of the environment.

The logic is specified by providing a new `pow._eval()` function, which takes 2 arguments: the string to be parsed and the current context data.

**Example:**
```html
<script type="module">
pow._eval = (expr, ctxt) => {
    // expr: 'child.text'
    // ctxt: { child: { text: "my value" } }
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
> [See the quickstart example using pow.safe in action 🏃‍➡️](https://jsfiddle.net/IFYates/jwaqme8o/)

As of `v1.3.0`, pow.safe also rebinds [element events](#events) after every `apply()` to remove dynamic code.
> [See the interaction example using pow.safe in action 🏃‍➡️](https://ifyates.github.io/pow.js/examples/interaction.safe.html)

## Bindings
Any element can be used to control a binding, as long as it has the `pow` attribute.

If the binding element is a `template`, it will be replaced in its entirety. Other elements will only have their contents replaced.  
The other advantage of using `template` is that it will not render anything until `apply()` has completed.

The default context will be the `data` provided to the `apply()` function, but the context can be changed by binding to a child element.

**Example:**
```html
<!-- pow.apply(document.body, data) -->
<body><!-- *data = data -->
    <p><!-- *data = data -->
        <template pow item="child"><!-- *data = data.child -->
            <p><!-- *data = data.child -->
```

### Attributes <small><sup>`v1.4.0`</sup></small>
In general, all placeholders in bound HTML are interpolated, so there is nothing special needed for setting attribute values.

However, attributes on bound elements (with the `pow` attribute) have more logic applied to them:
* :attributes (names beginning `:`) will have the `:` removed and be fully interpolated, only setting/overwriting the attribute if it is truthy, and
* If an attribute template resolves to a null value (`''`, `null`, `undefined`), it will be removed. Note that `false` and `0` will be displayed verbatim.

**Examples:**
* Bound element with a truthy attribute value:
    ```html
    <!-- data: { isChecked: 'truthy' } -->
    <input pow type="checkbox" checked="{{ isChecked }}" />
    <!-- Result --><input type="checkbox" checked="truthy" />
    ```
* Bound element with a null/missing attribute:
    ```html
    <!-- data: { } -->
    <input pow type="checkbox" checked="{{ isChecked }}" />
    <!-- Result --><input type="checkbox" />
    ```
* Unbound element with a null/missing attribute:
    ```html
    <!-- data: { } -->
    <input type="checkbox" checked="{{ isChecked }}" />
    <!-- Result --><input type="checkbox" checked="" />
    ```
* Unbound element with an attribute that evaluates to `false`:
    ```html
    <!-- data: { isChecked: false } -->
    <input type="checkbox" checked="{{ isChecked }}" />
    <!-- Result --><input type="checkbox" checked="false" />
    ```
* Bound element with a truthy :attribute value, which overwrites an existing attribute:
    ```html
    <!-- data: { value: 'replaced' } -->
    <div pow class="existing" :class="value">
    <!-- Result --><div class="replaced">
    ```
* Bound element with a :attribute that evaluates to a null value, leaving the existing attribute:
    ```html
    <!-- data: { } -->
    <div pow class="existing" :class="value">
    <!-- Result --><div class="existing">
    ```

### Conditional
**_pow💥_** bindings support a basic set of conditions:
* `if="cond"`, `ifnot="cond"`
* `else-if="cond"`, `else-ifnot="cond"`
* `else`

The `else*` conditions are only evaluated if placed as siblings to a lead `if` template.
```html
<div pow if="cond">Always checked</div> <!-- Not part of following set -->
<div pow if="cond">Always checked; new condition set</div>
<div pow else-if="cond">Only checked if prior sibling "if" was false</div>
<div pow else-if="cond">Only checked if all prior sibling "if" and "else-if"s were false</div>
<div pow else>Only checked if all prior sibling "if" and "else-if"s were false</div>
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

#### Post-loop conditions <sup>`v1.2.0`</sup>
The `else` logic can be applied to loops, used when the loop does not produce an output.

**Example:**
```html
<!-- pow.apply(document.body, { list: [] }) -->
<body>
    <div pow array="list">{{ *data }}</div>
    <div pow else>This is nothing in your list</div>
```

### Reusable templates <small><sup>`v1.2.0`</sup></small>
If you have a particularly complex template, **_pow💥_** can insert a copy of it using the `template` binding, replacing the bound element.  
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

### Stop <small><sup>`v1.4.0`</sup></small>
The `stop` binding will prevent an element and it's children from being processed further by the current `apply()`.

Note that the binding logic is destructive to elements, even with `stop`, so any element references taken before will be void.

**Example:**
```html
<body>
    {{ text1 }}
    <div pow stop>{{ ignore }}</div>
    {{ text2 }}
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
    * Already have create (`attr="{{ expr }}"`) and replace (`:attr="expr"`). Append could be `:add:attr="expr"`? Dynamic `::interpolate::="expr"`? or `:attr="'+' + expr"`?
* async support on function resolution
* Switch statement
   ```html
   <template pow switch="token">
       <div case="{{ token }}">...</div>
       <div case="literal">...</div>
   </template>
   ```
* Review the `*` syntax for accessing meta-context - makes certain expressions impossible (`*data == *root.value`)  
   Likely just always expose `$data`, `$root`, `$path`, `$index`, etc.