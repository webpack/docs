# Development server

Even better it is with the development server.

``` text
npm install webpack-dev-server -g
```

``` text
webpack-dev-server --progress --colors
```

It binds a small express server on localhost:8080 which serves your static assets as well as the bundle (compiled automatically). It automatically updates the browser page when a bundle is recompiled (socket.io). Open [http://localhost:8080/webpack-dev-server/bundle](http://localhost:8080/webpack-dev-server/bundle) in your browser.

> The dev server uses webpack's watch mode. It also prevents webpack from emitting the result files to disk. Instead it keep and serve result files from memory.
