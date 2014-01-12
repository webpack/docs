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

``` text
Hash: 2337c86f7be0011cdd4815c5073bed80
Time: 27ms
    Asset  Size  Chunks  Chunk Names
bundle.js   982       0  main
   [0] ./entry.js 28 [built] {0}
```

Open `index.js` in your browser. It should display `It works.`

$$$ output

$$$ index.html