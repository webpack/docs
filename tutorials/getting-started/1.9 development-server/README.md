# Development server

The development server is even better.

``` text
npm install webpack-dev-server -g
```

``` text
webpack-dev-server --progress --colors
```

This binds a small express server on localhost:8080 which serves your static assets as well as the bundle (compiled automatically). It automatically updates the browser page when a bundle is recompiled (socket.io). Open [http://localhost:8080/webpack-dev-server/bundle](http://localhost:8080/webpack-dev-server/bundle) in your browser.

> The dev server uses webpack's watch mode. It also prevents webpack from emitting the resulting files to disk. Instead it keeps and serves the resulting files from memory.
