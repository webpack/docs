Our html still contains another static resource: `style.less.css` (compiled from `style.less`).

We want it bundled too! With webpack that's easy:

## stylesheets

We need more loaders:

* One to transform less to css: `less-loader`
* One to transform css to javascript: `css-loader`
* One to add css to the DOM: `style-loader`

``` sh
npm install less-loader css-loader style-loader
```

These loaders need to be applied for less files. We can configure this in the configuration and just `require` the stylesheet.

$$$ files

Because webpack can handle `less` the extra step of compiling the `less` file can be omitted.

Note: You can remove the generated file `styles.less.css`.

## Summary

We moved all referenced static resources into the bundle...

> Note: If you write a single page application this step is useful, but if you write a progressively enhanced application you shouldn't do it.

$$$ index.html