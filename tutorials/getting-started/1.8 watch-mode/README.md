# Watch mode

We don't want to manually recompile after every change...

``` text
webpack --progress --colors --watch
```

Webpack can cache unchanged modules between compilations. Just add `--cache` or insert it into your config file: 

$$$ files

> When using watch mode, webpack installs file watchers to all files, which were used in the compilation process. If any change is detected, it'll run the compilation again. When caching is enabled, webpack keeps each module in memory and will reuse it if it isn't changed.
