# Binding loaders

We don't want to write such long requires `require("!style!css!./style.css");`.

We can bind file extensions to loaders so we just need to write: `require("./style.css")`

$$$ files

Run the compilation with:

``` text
webpack ./entry.js bundle.js --module-bind 'css=style!css'
```

> Some environments may require double quotes: --module-bind "css=style!css"

You should see the same result:

$$$ index.html
