# Changelog

## 1.10.0 -- 2020/10/27
- `beforeExec`支持传入`code, script`，如果返回值是非空string，那么将会替换掉原先的code
- 新增每个js文件/inline script执行完毕之后的hook： `afterExec`，参数和`beforeExec`一样，但是无返回值
