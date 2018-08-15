# html-import
import html and handle the exports from the entry

A html loader for single-spa

```html
<!-- subApp/index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>test</title>
</head>
<body>

<script src="https://unpkg.com/mobx@5.0.3/lib/mobx.umd.js"></script>
</body>
</html>
```

```js
import importHTML from 'html-import';

importHTML('./subApp/index.html')
    .then(res => {
    	console.log(res.template);
    	
    	const mobx = res.exports;
    	const { observable } = mobx;
    	observable({
    	    name: 'kuitos'
    	})
    });
```
