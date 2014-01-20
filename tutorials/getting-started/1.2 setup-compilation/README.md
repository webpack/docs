# Setup the compilation

Start with a empty directory.

Create these files:

$$$ files

Then run the following:

``` sh
$ webpack ./entry.js bundle.js
```

It will compile your file and create a bundle file.

If successful it displays something like this:

$$$ output

Open `index.js` in your browser. It should display `It works.`

$$$ index.html