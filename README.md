## DEMO

### Draggable

- [单独的拖拽](https://wya-team.github.io/wya-vm/examples/dist/home/draggable/alone)
- [组合的拖拽](https://wya-team.github.io/wya-vm/examples/dist/home/draggable)

### Sortable

- [组合的拖拽](https://wya-team.github.io/wya-vm/examples/dist/home/sortable)

## 基本组件

### Draggable

- api

属性 | 说明 | 类型 | 默认值
---|---|---|---
disabled | - | `any` | -
handles | - | `any` | -
w | - | `any` | -
h | - | `any` | -
r | - | `any` | -
minW | - | `any` | -
minH | - | `any` | -
x | - | `any` | -
y | - | `any` | -
z | - | `any` | -
scale | - | `any` | -
grid | - | `any` | -
guides | - | `any` | -
restrain | - | `any` | -
parent | - | `any` | -
entryRegExp | - | `any` | -
editorRegExp | - | `any` | -
prevent | - | `any` | -
preventRegExp | - | `any` | -
preventRegExp | - | `any` | -
closeable | - | `any` | -
draggable | - | `any` | -
resizable | - | `any` | -
rotatable | - | `any` | -
active | - | `any` | -

- 事件

属性 | 说明 | 类型 | 默认值
---|---|---|---
activated | - | `any` | -
deactivated | - | `any` | -
resizing | - | `any` | -
rotating | - | `any` | -
dragging | - | `any` | -
resize-end | - | `any` | -
rotate-end | - | `any` | -
drag-end | - | `any` | -
end | - | `any` | -
delete | - | `any` | -

### Sortable

- api

属性 | 说明 | 类型 | 默认值
---|---|---|---
index | - | `any` | -
type | - | `any` | -
disabled | - | `any` | -
entryRegExp | - | `any` | -
editorRegExp | - | `any` | -
prevent | - | `any` | -
preventRegExp | - | `any` | -
closeable | - | `any` | -

- 事件

属性 | 说明 | 类型 | 默认值
---|---|---|---
activated | - | `any` | -
deactivated | - | `any` | -
sorting | - | `any` | -
sort-end | - | `any` | -
highlight-change | - | `any` | -
delete | - | `any` | -


### Widget

- api

属性 | 说明 | 类型 | 默认值
---|---|---|---
index | - | `any` | -
module | - | `any` | -
draggable | - | `any` | -


- 事件

属性 | 说明 | 类型 | 默认值
---|---|---|---
click | 待开发 | `any` | -



## 组合组件

### root

属性 | 说明 | 类型 | 默认值
---|---|---|---
module | 模块，必须是连字符`xx-xx` | `any` | -
type | 类型 | `any` | -
name | 名称 | `any` | -
Viewer | 展示视图 | `any` | -
Editor | 编辑（需要特定的事件） | `any` | -
Widget | 组件/控件 | `any` | -
widgets | 组件/控件展开 | `any` | -
showWidget | 是否显示控件按钮 | `any` | -
max | - | `any` | -
insertion | `first/last/every` | `String` | -
data | 编辑的数据，一部分需要配合CORE的API参数 | `Object` `Function` | -
dataValidity | 数据校验 | `Function` | -
rebuilder | 针对data补全数据用 | `Object` `Function` | -

> Viewer 组件会提供一个参数vm, vm.type用来告知当前是`frame`还是`preview`下的内容

#### data

> 为函数时，参数1（index）表示展开组件拖动的索引

##### Draggable

属性 | 说明 | 类型 | 默认值
---|---|---|---
...Draggbale组件上的参数和Viewer上 | - | `any` | -

##### Sortable

属性 | 说明 | 类型 | 默认值
---|---|---|---
wrapperStyle | - | `Object`, `Function` | -
...Sortable组件上的参数和Viewer上 | - | `any` | -



## TODO

- 集成`vc-scroller`去除滚动条占位的影响