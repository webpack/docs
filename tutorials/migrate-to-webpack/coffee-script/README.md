# Preprocess coffeescript

We want webpack to compile coffeescript to javascript while compiling.

## Install the coffeescript loader

``` sh
npm install coffee-loader
```

## Create The Bundle

``` sh
webpack app.coffee bundle.js --module-bind coffee
```

This binds the extension `.coffee` to the loader `coffee-loader`.

Note: The generated file `app.coffee.js` can be deleted.

## Summary

webpack now compiles coffeescript to javascript for us.

$$$ index.html
