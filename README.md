# pow.js 💥
An extremely small and lightweight templating framework.

[![NPM Version](https://img.shields.io/npm/v/pow-templating)](https://www.npmjs.com/package/pow-templating)
![pow.min.js file size in bytes](https://img.shields.io/github/size/IFYates/pow.js/dist%2Fpow.min.js?label=pow.min.js)


> 😲 Only 140 LOCs!  
> 🤏 <2&frac13; KiB minified script (+ header)  
> 🧩 No other dependencies  
> ✅ [100% test coverage](https://ifyates.github.io/pow.js/coverage/lcov-report)

### [Read the full documentation](https://ifyates.github.io/pow.js/docs/)

# Project goals
* A very small library that can be included without additional dependencies
* Provides clear templating and interpolation
* Extensible functionality through function calling and templates
* Works without any server
* Fast enough to be used in a production environment
* Deterministic output

# Installation
Get the [npm module](https://www.npmjs.com/package/pow-templating) or import directly from any javascript module:
```js
import pow from 'https://ifyates.github.io/pow.js/latest/pow.min.js'
```

Looking at CDN hosting soon.

# Example
> [See it in action at JSFiddle 🏃‍➡️](https://jsfiddle.net/IFYates/qtngjxbu/)
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
    <p pow data="creation">
        Created by <em>{{ author }}</em> on {{ date }}
    </p>
    <p>
        Tags:
        <template pow array="tags">
            [<span>{{ $data }}</span>]<span ifnot="$last">, </span>
        </template>
    </p>
</body>
```

# Learn more
### [Read the full documentation](https://ifyates.github.io/pow.js/docs/)