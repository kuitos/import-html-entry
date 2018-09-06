# html-import
A html loader for single-spa

Treats the index html as entry, fetch the template and exports.  

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
