# threegn

Procedural 3D graphics editor for the web

_If you like what I do, consider supporting my work via donation_

[![](https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-1.svg)](https://www.buymeacoffee.com/romanliutikov)

## Contents

- Blender script to export geo nodes as JSON [src/addon/export.py](https://github.com/roman01la/threegn/blob/main/src/addon/export.py)
- Nodes editor [src/editor](https://github.com/roman01la/threegn/tree/main/src/editor)
- Nodes graph evaluator [src/evaluator.js](https://github.com/roman01la/threegn/blob/main/src/evaluator.js)
- Nodes impl [src/nodes.js](https://github.com/roman01la/threegn/blob/main/src/nodes.js)

## Development

```
yarn dev
```

## Resources
- a blog post [ThreeGN devlog 1](https://www.romanliutikov.com/blog/threegn-1.html)

## Note

The project is not actively maintained, most certainly there's a lot of bugs and a bunch of nodes are missing. Yet the code here can serve as a foundation and inspiration. The best way to port remaining geo nodes is to read Blender's source.
