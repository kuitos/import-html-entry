# import-html-entry
Treats the index html as manifest and loads the assets(css,js), and get the entry script exports.

```html
<!-- subApp/index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>test</title>
</head>
<body>

<!-- mark the entry script with entry attribute -->
<script src="https://unpkg.com/mobx@5.0.3/lib/mobx.umd.js" entry></script>
<script src="https://unpkg.com/react@16.4.2/umd/react.production.min.js"></script>
</body>
</html>
```

```js
import importHTML from 'html-import-entry';

importHTML('./subApp/index.html')
    .then(res => {
        console.log(res.template);

        res.loadScripts().then(exports => {
            const mobx = exports;
            const { observable } = mobx;
            observable({
                name: 'kuitos'
            })	
        })
});
```

Never forget to add this config to your webpack to disable System transpliation, see https://github.com/kuitos/import-html-entry/blob/master/webpack.config.js#L35:
```json
{ parser: { system: false } },
```
