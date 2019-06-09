## DEMO

### Draggable

- [组合的拖拽](https://wya-team.github.io/wya-vm/examples/dist/home/draggable)

### Sortable

- [组合的拖拽](https://wya-team.github.io/wya-vm/examples/dist/home/sortable)

## 参数

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
max | - | `any` | -
insertion | `first/last/every` | `String` | -
data | 编辑的数据，一部分需要配合CORE的API参数 | `Object` `Function` | -
dataValidity | 数据校验 | `Function` | -

> Viewer 组件会提供一个参数vmType, 用来告知当前是`frame`还是`preview`下的内容

- data

> 为函数时，参数1（index）表示展开组件拖动的索引


