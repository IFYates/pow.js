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
The `$path` interpolation is intended to help in these situations.

A particularly common mistake is not closing tags correctly or incorrect nestings (e.g., `div` tags cannot be inside `p` tags).

**Example:**
```html
{{ $path }}<!-- '$root' -->
<p pow item="list">
    {{ $path }}<!-- '$root.list' -->
    <div pow array><!-- 'div' element cannot be inside a 'p' and will be shifted outside -->
        {{ $path }}<!-- '$root' -->
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
* Issue: rebinding root template
* What to do about unknown template?
* Template wrapping - pass the content of the parent to the child (`$body`?)
* Subtemplates - template bind content 
* Binding to function that can modify element