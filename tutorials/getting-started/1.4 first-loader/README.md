# The first loader

We want to add a css file to our application.

Webpack can only handle js natively, so we need the `css-loader` to process css files. We also need the `style-loader` to apply the styles in the css file.

Create a empty `node_modules` folder.

Run `npm install css-loader style-loader` to install the loaders. (They need to be installed locally, without `-g`)

Let's use them:

$$$ files

Recompile and update your browser to see your application with yellow background.

$$$ index.html

> By prefixing loaders to a module request, the module went through a loader pipeline. These loader transform the file content in specific ways. After these transformations are applied, the result is a javascript module.
