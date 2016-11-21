We use jQuery in the app. But wait jQuery is javascript. Should it not be a dependency which can be required?

Yes. Let's create a `jquery` web module so it can be required:

## jquery web module

* Create a folder `web_modules`.
* Put the jquery library into this folder as `jquery.js`

$$$ files

Not relative require calls are looked up in modules folders. For web modules we can use a folder `"web_modules"`.

## Summary

All javascript stuff is now bundled.

$$$ index.html