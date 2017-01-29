# The first loader

We want to add a CSS file to our application.

webpack can only handle JavaScript natively, so we need the `css-loader` to process CSS files. We also need the `style-loader` to apply the styles in the CSS file.

Run `npm install css-loader style-loader` to install the loaders. (They need to be installed locally, without `-g`) This will create a `node_modules` folder for you, in which the loaders will live.

Let's use them:

$$$ files

Recompile and reload your browser window to see your application with yellow background.

$$$ index.html

> By prefixing loaders to a module request, the module went through a loader pipeline. These loaders transform the file content in specific ways. After these transformations are applied, the result is a JavaScript module.
