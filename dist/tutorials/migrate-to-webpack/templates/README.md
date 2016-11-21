Our html still contains another static resource: `style.less.css` (compiled from `style.less`).

... but there is still a static resource hidden. The html code.

You guess it, we can bundle it too. Because I like `jade` templates:

``` sh
npm install jade-loader
```

$$$ files

## Summary

So finally we really moved **all** static resources into the bundle!

> Note: This is again of course not suitable for a progressively enhanced application.

$$$ index.html