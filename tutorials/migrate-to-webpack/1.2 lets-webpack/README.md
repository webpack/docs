# Let's webpack

In the first step we want to use webpack for bundling the single file.

We care for handling coffeescript in the next step. For now we just bundle the generated js file.

It's assumed you have webpack installed. See others guides for instructions.

## Create The Bundle

```
webpack app.coffee.js bundle.js
```

## Use The Bundle

We can remove the `app.coffee.js` file from the html and use the bundled version instead:

$$$ files

## Summary

The single file `app.coffee.js` now goes though webpack.

$$$ index.html
