import { readFileSync } from 'fs';
import processTpl, {
	genIgnoreAssetReplaceSymbol,
	genLinkReplaceSymbol,
	genModuleScriptReplaceSymbol,
	genScriptReplaceSymbol,
} from '../process-tpl';

test('test process-tpl', () => {

	const tpl = '<!DOCTYPE html><html><head>\n' +
		'\n' +
		'<link rel="shortcut icon" href="https://t.alipayobjects.com/images/rmsweb/T1pqpiXfJgXXXXXXXX.png" type="image/x-icon">\n' +
		'<link rel="preload" href="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js">\n' +
		'<link rel="prefetch" href="/a3-ie6-polyfill.js">\n' +
		'<link rel="stylesheet" href="/umi.css">\n' +
		'<link rel="stylesheet" href="/escape-character&nbsp;.css?a=&amp;&b=2">\n' +
		'<link rel="preload" as="font" href="/static/fonts/iconfont.woff" type="font/woff" crossorigin="anonymous">\n' +
		'\n' +
		'<meta charset="utf-8">\n' +
		'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n' +
		'<title>&#x91D1;&#x878D;&#x4E91;&#x63A7;&#x5236;&#x53F0;</title>\n' +
		'<script data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script \n ' +
		'data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script>\n' +
		'\n' +
		'// umi version: 2.2.8\n' +
		'// build time: Wed Dec 26 2018 17:54:47 GMT+0800 (CST)\n' +
		'\n' +
		'</script>\n' +
		'<script src="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js"></script>\n' +
		'<script \n' +
		'  src="https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js"\n' +
		'  crossorigin="anonymous"' +
		'></script>' +
		'<script \n' +
		'  src="/main-es2015.js"\n' +
		'  type="module"' +
		'></script>' +
		'<script \n' +
		'  src="/main-es5.js"\n' +
		'  nomodule' +
		'></script>' +
		'<script src="/test-type.json" type="test"></script>' +
		'<script type=systemjs-importmap>{"a": 1}</script>' +
		'<script \n' +
		'  src="/test-async.js"\n' +
		'  async' +
		'></script>' +
		'<style>\n' +
		'body {\n' +
		'background-color: red;\n' +
		'}\n' +
		'</style>\n' +
		'</head>\n' +
		'<body>\n' +
		'\n' +
		'<div id="root"></div>\n' +
		'\n' +
		'<script src="/umi.js"></script>\n' +
		'<script src="/escape-character&amp;.js"></script>' +
		'<!-- <script src="/a1.js"></script>' +
		'-->' +
		'<script src="/comment.js"></script>\n' +
		'<!-- <script src="/a2.js"></script>\n' +
		'-->' +
		'<!--[if IE 6]>\n' +
		'<!-- <script src="/a3-ie6-polyfill.js"></script>\n' +
		'<![endif]-->' +
		'\n' +
		'\n' +
		'</body></html>';

	const { entry, scripts, template } = processTpl(tpl, 'http://kuitos.me');
	expect(entry).toBe('http://kuitos.me/comment.js');
	expect(scripts).toEqual([
		'<script data-test>\n  window.routerBase = "/";\n</script>',
		'<script \n data-test>\n  window.routerBase = "/";\n</script>',
		'http://gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js',
		'https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js',
		// Jest/jsdom doesn't support module scripts, so nomodule scripts will be imported in test cases.
		// https://github.com/jsdom/jsdom/issues/2475
		'http://kuitos.me/main-es5.js',
		{
			async: true,
			crossOrigin: false,
			src: 'http://kuitos.me/test-async.js',
		},
		'http://kuitos.me/umi.js',
		'http://kuitos.me/escape-character&.js',
		'http://kuitos.me/comment.js']);
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/test-async.js', true)) !== -1).toBeTruthy();
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/escape-character%C2%A0.css?a=&&b=2')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/umi.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/escape-character&.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/comment.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/main-es5.js')) !== -1).toBeTruthy();
	expect(template.indexOf('<script src="/test-type.json" type="test"></script>') !== -1).toBeTruthy();
	expect(template.indexOf('<script type=systemjs-importmap>{"a": 1}</script>') !== -1).toBeTruthy();

	// link as font 资源直接被 ignore
	expect(template.indexOf('<link rel="preload" as="font" href="/static/fonts/iconfont.woff" type="font/woff" crossorigin="anonymous">') !== -1).toBeTruthy();
	// preload 资源直接被 ignore
	expect(template.indexOf('<link rel="preload" href="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js">') === -1).toBeTruthy();
	// prefetch/preload 会被 replace
	expect(template.indexOf(genLinkReplaceSymbol('/a3-ie6-polyfill.js', true)) !== -1).toBeTruthy();
	// prefetch 资源直接被 ignore
	expect(template.indexOf('<link rel="prefetch" href="/a3-ie6-polyfill.js">') === -1).toBeTruthy();
	// type="module" 资源被 ignore
	expect(template.indexOf(genModuleScriptReplaceSymbol('/main-es2015.js', false)) === -1).toBeTruthy();

	const { styles, template: template2 } = processTpl(tpl, 'http://kuitos.me/cdn/');
	expect(styles[0]).toBe('http://kuitos.me/umi.css');
	expect(styles[1]).toBe('http://kuitos.me/escape-character%C2%A0.css?a=&&b=2');
	expect(template2.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();

});

test('test process-tpl with entry specified', () => {

	const tpl = '<!DOCTYPE html><html><head>\n' +
		'\n' +
		'<link rel="shortcut icon" href="https://t.alipayobjects.com/images/rmsweb/T1pqpiXfJgXXXXXXXX.png" type="image/x-icon">\n' +
		'<link rel="preload" href="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js">\n' +
		'<link rel="prefetch" href="/a3-ie6-polyfill.js">\n' +
		'<link rel="stylesheet" href="/umi.css">\n' +
		'<link rel="stylesheet" href="/escape-character&nbsp;.css?a=&amp;&b=2">\n' +
		'<link rel="preload" as="font" href="/static/fonts/iconfont.woff" type="font/woff" crossorigin="anonymous">\n' +
		'\n' +
		'<meta charset="utf-8">\n' +
		'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n' +
		'<title>&#x91D1;&#x878D;&#x4E91;&#x63A7;&#x5236;&#x53F0;</title>\n' +
		'<script data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script \n ' +
		'data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script>\n' +
		'\n' +
		'// umi version: 2.2.8\n' +
		'// build time: Wed Dec 26 2018 17:54:47 GMT+0800 (CST)\n' +
		'\n' +
		'</script>\n' +
		'<script src="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js"></script>\n' +
		'<script \n' +
		'  src="https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js"\n' +
		'  crossorigin="anonymous"' +
		'></script>' +
		'<script \n' +
		'  src="/main-es2015.js"\n' +
		'  type="module"' +
		'></script>' +
		'<script \n' +
		'  src="/main-es5.js"\n' +
		'  nomodule' +
		'></script>' +
		'<script src="/test-type.json" type="test"></script>' +
		'<script type=systemjs-importmap>{"a": 1}</script>' +
		'<script \n' +
		'  src="/test-async.js"\n' +
		'  async' +
		'></script>' +
		'<style>\n' +
		'body {\n' +
		'background-color: red;\n' +
		'}\n' +
		'</style>\n' +
		'</head>\n' +
		'<body>\n' +
		'\n' +
		'<div id="root"></div>\n' +
		'\n' +
		'<script src="//a.com/umi.js" entry></script>\n' +
		'<script src="/escape-character&amp;.js"></script>' +
		'<!-- <script src="/a1.js"></script>' +
		'-->' +
		'<script src="/comment.js"></script>\n' +
		'<!-- <script src="/a2.js"></script>\n' +
		'-->' +
		'<!--[if IE 6]>\n' +
		'<!-- <script src="/a3-ie6-polyfill.js"></script>\n' +
		'<![endif]-->' +
		'\n' +
		'\n' +
		'</body></html>';

	const { entry, scripts, template } = processTpl(tpl, 'http://kuitos.me');
	expect(entry).toBe('http://a.com/umi.js');
	expect(scripts).toEqual([
		'<script data-test>\n  window.routerBase = "/";\n</script>',
		'<script \n data-test>\n  window.routerBase = "/";\n</script>',
		'http://gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js',
		'https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js',
		// Jest/jsdom doesn't support module scripts, so nomodule scripts will be imported in test cases.
		// https://github.com/jsdom/jsdom/issues/2475
		'http://kuitos.me/main-es5.js',
		{
			async: true,
			src: 'http://kuitos.me/test-async.js',
			crossOrigin: false,
		},
		'http://a.com/umi.js',
		'http://kuitos.me/escape-character&.js',
		'http://kuitos.me/comment.js']);
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/test-async.js', true)) !== -1).toBeTruthy();
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/escape-character%C2%A0.css?a=&&b=2')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://a.com/umi.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/escape-character&.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/comment.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/main-es5.js')) !== -1).toBeTruthy();
	expect(template.indexOf('<script src="/test-type.json" type="test"></script>') !== -1).toBeTruthy();
	expect(template.indexOf('<script type=systemjs-importmap>{"a": 1}</script>') !== -1).toBeTruthy();

	// link as font 资源直接被 ignore
	expect(template.indexOf('<link rel="preload" as="font" href="/static/fonts/iconfont.woff" type="font/woff" crossorigin="anonymous">') !== -1).toBeTruthy();
	// preload 资源直接被 ignore
	expect(template.indexOf('<link rel="preload" href="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js">') === -1).toBeTruthy();
	// prefetch/preload 会被 replace
	expect(template.indexOf(genLinkReplaceSymbol('/a3-ie6-polyfill.js', true)) !== -1).toBeTruthy();
	// prefetch 资源直接被 ignore
	expect(template.indexOf('<link rel="prefetch" href="/a3-ie6-polyfill.js">') === -1).toBeTruthy();
	// type="module" 资源被 ignore
	expect(template.indexOf(genModuleScriptReplaceSymbol('/main-es2015.js', false)) === -1).toBeTruthy();

	const { styles, template: template2 } = processTpl(tpl, 'http://kuitos.me/cdn/');
	expect(styles[0]).toBe('http://kuitos.me/umi.css');
	expect(styles[1]).toBe('http://kuitos.me/escape-character%C2%A0.css?a=&&b=2');
	expect(template2.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();

});

test('test ignore js or css', () => {
	const tpl = readFileSync(require.resolve('./fixtures/ignore-js-css.html'), { encoding: 'utf-8' });

	const { entry, template } = processTpl(tpl, 'http://kuitos.me/cdn/');
	expect(entry).toBe('http://kuitos.me/cdn/app.js');

	expect(template.indexOf(genIgnoreAssetReplaceSymbol('style file')) !== -1).toBeTruthy();

	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) === -1).toBeTruthy();
	expect(template.indexOf(genIgnoreAssetReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();

	expect(template.indexOf(genScriptReplaceSymbol('//cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js')) === -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/polyfill.js')) === -1).toBeTruthy();
	expect(template.indexOf(genIgnoreAssetReplaceSymbol('http://kuitos.me/polyfill.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genIgnoreAssetReplaceSymbol('js file')) !== -1).toBeTruthy();
});

test('test resource with no quotation marks', () => {

	const tpl = '<!DOCTYPE html><html><head>\n' +
		'\n' +
		'<link rel="shortcut icon" href=https://t.alipayobjects.com/images/rmsweb/T1pqpiXfJgXXXXXXXX.png type="image/x-icon">\n' +
		'<link rel="preload" href=//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js>\n' +
		'<link rel="prefetch" href=/a3-ie6-polyfill.js>\n' +
		'<link rel=stylesheet href=/umi.css>\n' +
		'\n' +
		'<meta charset="utf-8">\n' +
		'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n' +
		'<title>&#x91D1;&#x878D;&#x4E91;&#x63A7;&#x5236;&#x53F0;</title>\n' +
		'<script data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script \n ' +
		'data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script>\n' +
		'\n' +
		'// umi version: 2.2.8\n' +
		'// build time: Wed Dec 26 2018 17:54:47 GMT+0800 (CST)\n' +
		'\n' +
		'</script>\n' +
		'<script src=//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js></script>\n' +
		'<script \n' +
		'  src=https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js\n' +
		'  crossorigin="anonymous"' +
		'></script>' +
		'<script \n' +
		'  src=/main-es2015.js\n' +
		'  type=module' +
		'></script>' +
		'<script \n' +
		'  src=/main-es5.js\n' +
		'  nomodule' +
		'></script>' +
		'<style>\n' +
		'body {\n' +
		'background-color: red;\n' +
		'}\n' +
		'</style>\n' +
		'</head>\n' +
		'<body>\n' +
		'\n' +
		'<div id="root"></div>\n' +
		'\n' +
		'<script src=/umi.js></script>\n' +
		'<!-- <script src=/a1.js></script>' +
		'-->' +
		'<script src=/comment.js></script>\n' +
		'<!-- <script src=/a2.js></script>\n' +
		'-->' +
		'<!--[if IE 6]>\n' +
		'<!-- <script src=/a3-ie6-polyfill.js></script>\n' +
		'<![endif]-->' +
		'\n' +
		'\n' +
		'</body></html>';

	const { entry, scripts, template } = processTpl(tpl, 'http://kuitos.me');
	expect(entry).toBe('http://kuitos.me/comment.js');
	expect(scripts).toEqual(['<script data-test>\n  window.routerBase = "/";\n</script>',
		'<script \n data-test>\n  window.routerBase = "/";\n</script>',
		'http://gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js',
		'https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js',
		'http://kuitos.me/main-es5.js',
		'http://kuitos.me/umi.js',
		'http://kuitos.me/comment.js']);
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/umi.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/comment.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/main-es5.js')) !== -1).toBeTruthy();

	// preload 资源直接被忽略
	expect(template.indexOf('<link rel="preload" href=//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js>') === -1).toBeTruthy();
	// preload/prefetch 资源被 replace
	expect(template.indexOf(genLinkReplaceSymbol('/a3-ie6-polyfill.js', true)) !== -1).toBeTruthy();
	expect(template.indexOf('<link rel="prefetch" href=http://kuitos.me/a3-ie6-polyfill.js>') === -1).toBeTruthy();
	// type="module" 资源被 ignore
	expect(template.indexOf(genModuleScriptReplaceSymbol('/main-es2015.js', false)) === -1).toBeTruthy();

	const { styles, template: template2 } = processTpl(tpl, 'http://kuitos.me/cdn');
	expect(styles[0]).toBe('http://kuitos.me/umi.css');
	expect(template2.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();

});

test('test resource mixing quotation marks', () => {

	const tpl = '<!DOCTYPE html><html><head>\n' +
		'\n' +
		'<link rel="shortcut icon" href=https://t.alipayobjects.com/images/rmsweb/T1pqpiXfJgXXXXXXXX.png type="image/x-icon">\n' +
		'<link rel="preload" href=//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js>\n' +
		'<link rel="prefetch" href="/a3-ie6-polyfill.js">\n' +
		'<link rel=stylesheet href="/umi.css">\n' +
		'\n' +
		'<meta charset="utf-8">\n' +
		'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n' +
		'<title>&#x91D1;&#x878D;&#x4E91;&#x63A7;&#x5236;&#x53F0;</title>\n' +
		'<script data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script \n ' +
		'data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script>\n' +
		'\n' +
		'// umi version: 2.2.8\n' +
		'// build time: Wed Dec 26 2018 17:54:47 GMT+0800 (CST)\n' +
		'\n' +
		'</script>\n' +
		'<script src="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js"></script>\n' +
		'<script \n' +
		'  src=https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js\n' +
		'  crossorigin="anonymous"' +
		'></script>' +
		'<script \n' +
		'  src=/main-es2015.js\n' +
		'  type=\'module\'' +
		'></script>' +
		'<script \n' +
		'  src=\'/main-es5.js\'\n' +
		'  nomodule' +
		'></script>' +
		'<style>\n' +
		'body {\n' +
		'background-color: red;\n' +
		'}\n' +
		'</style>\n' +
		'</head>\n' +
		'<body>\n' +
		'\n' +
		'<div id="root"></div>\n' +
		'\n' +
		'<script src=./umi.js></script>\n' +
		'<!-- <script src=/a1.js></script>' +
		'-->' +
		'<script src="./comment.js"></script>\n' +
		'<!-- <script src=/a2.js></script>\n' +
		'-->' +
		'<!--[if IE 6]>\n' +
		'<!-- <script src=/a3-ie6-polyfill.js></script>\n' +
		'<![endif]-->' +
		'\n' +
		'\n' +
		'</body></html>';

	const { entry, scripts, template } = processTpl(tpl, 'http://kuitos.me');
	expect(entry).toBe('http://kuitos.me/comment.js');
	expect(scripts).toEqual(['<script data-test>\n  window.routerBase = "/";\n</script>',
		'<script \n data-test>\n  window.routerBase = "/";\n</script>',
		'http://gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js',
		'https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js',
		'http://kuitos.me/main-es5.js',
		'http://kuitos.me/umi.js',
		'http://kuitos.me/comment.js']);
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/umi.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/comment.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/main-es5.js')) !== -1).toBeTruthy();

	// preload/prefetch 资源直接被 ignore
	expect(template.indexOf('<link rel="preload" href=//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js>') === -1).toBeTruthy();
	// 相对路径的补全 host
	expect(template.indexOf(genLinkReplaceSymbol('/a3-ie6-polyfill.js', true)) === -1).toBeFalsy();
	expect(template.indexOf('<link rel="prefetch" href="/a3-ie6-polyfill.js">') === -1).toBeTruthy();
	// type="module" 资源被 ignore
	expect(template.indexOf(genModuleScriptReplaceSymbol('/main-es2015.js', false)) === -1).toBeTruthy();

	const { styles, template: template2 } = processTpl(tpl, 'http://kuitos.me/cdn');
	expect(styles[0]).toBe('http://kuitos.me/umi.css');
	expect(template2.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();

});

test('should work with huge html content', () => {
	const hugeHtmlContent = readFileSync(require.resolve('./fixtures/huge-content.html'), 'utf-8');

	const start = Date.now();
	processTpl(hugeHtmlContent, '//test.com');
	const during = Date.now() - start;
	expect(during < 1000).toBeTruthy();
});

test('test crossorigin use-credentials attribute', () => {

	const tpl = '<!DOCTYPE html><html><head>\n' +
		'\n' +
		'<link rel="shortcut icon" href="https://t.alipayobjects.com/images/rmsweb/T1pqpiXfJgXXXXXXXX.png" type="image/x-icon">\n' +
		'<link rel="preload" href="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js">\n' +
		'<link rel="prefetch" href="/a3-ie6-polyfill.js">\n' +
		'<link rel="stylesheet" href="/umi.css">\n' +
		'<link rel="stylesheet" href="/escape-character&nbsp;.css?a=&amp;&b=2">\n' +
		'<link rel="preload" as="font" href="/static/fonts/iconfont.woff" type="font/woff" crossorigin="anonymous">\n' +
		'\n' +
		'<meta charset="utf-8">\n' +
		'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n' +
		'<title>&#x91D1;&#x878D;&#x4E91;&#x63A7;&#x5236;&#x53F0;</title>\n' +
		'<script data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script \n ' +
		'data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script>\n' +
		'\n' +
		'// umi version: 2.2.8\n' +
		'// build time: Wed Dec 26 2018 17:54:47 GMT+0800 (CST)\n' +
		'\n' +
		'</script>\n' +
		'<script src="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js"></script>\n' +
		'<script \n' +
		'  src="https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js"\n' +
		'  crossorigin="anonymous"' +
		'></script>' +
		'<script \n' +
		'  src="/main-es2015.js"\n' +
		'  type="module"' +
		'></script>' +
		'<script \n' +
		'  src="/main-es5.js"\n' +
		'  nomodule' +
		'></script>' +
		'<script src="/test-type.json" type="test"></script>' +
		'<script type=systemjs-importmap>{"a": 1}</script>' +
		'<script \n' +
		'  src="/test-async.js"\n' +
		'  async' +
		'></script>' +
		'<script \n' +
		'  src="/test-cors.js"\n' +
		'  crossorigin="use-credentials"' +
		'></script>' +
		'<style>\n' +
		'body {\n' +
		'background-color: red;\n' +
		'}\n' +
		'</style>\n' +
		'</head>\n' +
		'<body>\n' +
		'\n' +
		'<div id="root"></div>\n' +
		'\n' +
		'<script src="/umi.js"></script>\n' +
		'<script src="/escape-character&amp;.js"></script>' +
		'<!-- <script src="/a1.js"></script>' +
		'-->' +
		'<script src="/comment.js"></script>\n' +
		'<!-- <script src="/a2.js"></script>\n' +
		'-->' +
		'<!--[if IE 6]>\n' +
		'<!-- <script src="/a3-ie6-polyfill.js"></script>\n' +
		'<![endif]-->' +
		'\n' +
		'\n' +
		'</body></html>';

	const { entry, scripts, template } = processTpl(tpl, 'http://kuitos.me');
	expect(entry).toBe('http://kuitos.me/comment.js');
	expect(scripts).toEqual([
		'<script data-test>\n  window.routerBase = "/";\n</script>',
		'<script \n data-test>\n  window.routerBase = "/";\n</script>',
		'http://gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js',
		'https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js',
		// Jest/jsdom doesn't support module scripts, so nomodule scripts will be imported in test cases.
		// https://github.com/jsdom/jsdom/issues/2475
		'http://kuitos.me/main-es5.js',
		{
			async: true,
			src: 'http://kuitos.me/test-async.js',
			crossOrigin: false,
		},
		{
			async: false,
			src: 'http://kuitos.me/test-cors.js',
			crossOrigin: true,
		},
		'http://kuitos.me/umi.js',
		'http://kuitos.me/escape-character&.js',
		'http://kuitos.me/comment.js']);
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/test-async.js', true)) !== -1).toBeTruthy();
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/escape-character%C2%A0.css?a=&&b=2')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/umi.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/escape-character&.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/comment.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/main-es5.js')) !== -1).toBeTruthy();
	expect(template.indexOf('<script src="/test-type.json" type="test"></script>') !== -1).toBeTruthy();
	expect(template.indexOf('<script type=systemjs-importmap>{"a": 1}</script>') !== -1).toBeTruthy();

	// link as font 资源直接被 ignore
	expect(template.indexOf('<link rel="preload" as="font" href="/static/fonts/iconfont.woff" type="font/woff" crossorigin="anonymous">') !== -1).toBeTruthy();
	// preload 资源直接被 ignore
	expect(template.indexOf('<link rel="preload" href="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js">') === -1).toBeTruthy();
	// prefetch/preload 会被 replace
	expect(template.indexOf(genLinkReplaceSymbol('/a3-ie6-polyfill.js', true)) !== -1).toBeTruthy();
	// prefetch 资源直接被 ignore
	expect(template.indexOf('<link rel="prefetch" href="/a3-ie6-polyfill.js">') === -1).toBeTruthy();
	// type="module" 资源被 ignore
	expect(template.indexOf(genModuleScriptReplaceSymbol('/main-es2015.js', false)) === -1).toBeTruthy();

	const { styles, template: template2 } = processTpl(tpl, 'http://kuitos.me/cdn/');
	expect(styles[0]).toBe('http://kuitos.me/umi.css');
	expect(styles[1]).toBe('http://kuitos.me/escape-character%C2%A0.css?a=&&b=2');
	expect(template2.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();

});
