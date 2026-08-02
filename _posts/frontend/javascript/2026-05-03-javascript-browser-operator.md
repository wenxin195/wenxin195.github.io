---
key: javascript-browser-operator
title: "JavaScript 教程(5) 浏览器操作"
permalink: "/javascript-browser-operator"
tags:
  - JavaScript
author: Wenxin Zhong
layout: article
mermaid: true
modify_date: "2025-01-27 01:50:00"
---

<!--more-->

## EventTarget

## Document

`Document`接口表示任何在浏览器中载入的 Web 页面，并作为 Web 页面内容的入口，也就是 DOM 树。通常浏览器已经创建了代表当前页面的`document`对象。

`Document`接口的继承关系为：

<pre class="mermaid">
  classDiagram
    direction LR
    class EventTarget
    class Node
    class Document

    EventTarget <|-- Node
    Node <|-- Document
</pre>

### 实例属性

`Document`对象继承至`EventTarget`和`Node`接口，因此`Document`也可以使用`EventTarget`和`Node`的实例属性。

1. Document.body
2. Document.head
3. Document.images
4. Document.links
5. Document.scripts
6. Document.styleSheets

### 实例方法

`Document`对象继承至`EventTarget`和`Node`接口，因此`Document`也可以使用`EventTarget`和`Node`的实例方法。

1. Document.append()
2. Document.prepend()
3. Document.createAttribute()
4. Document.createElement()
5. Document.getElementById()
6. Document.getElementsByClassName()
7. Document.getElementsByTagName()
8. Document.querySelector()
9. Document.querySelectorAll()
10. Document.evaluate()

### 事件

可以使用`addEventListener()`或为该接口的事件处理器属性`oneventname`赋值的方式来监听这些事件。除了下面列出的事件之外，许多事件还可以在 DOM 树中包含的 Node 冒泡[^Bubbling]。

`Ducoment`接口还可以使用`Node`接口的事件。

1. DOMContentLoaded
2. scroll
3. scrollend
4. click
5. copy
6. cut
7. focus
8. input
9. mousemove
10. mouseout
11. moseover
12. paste
13. submit

## Element

- [Element](https://developer.mozilla.org/zh-CN/docs/Web/API/Element)

## Event

- [Event](https://developer.mozilla.org/zh-CN/docs/Web/API/Event)

## Location

- [Location](https://developer.mozilla.org/zh-CN/docs/Web/API/Location)

## Window

- [Window](https://developer.mozilla.org/zh-CN/docs/Web/API/Window)

## Screen

- [Screen](https://developer.mozilla.org/zh-CN/docs/Web/API/Screen)

[^Bubbling]: 当一个元素上的事件(比如点击事件)被触发时，这个事件不会只停留在该元素上，而是会像水中的气泡一样，从最内层的元素开始，逐级向上传播到它的父元素、祖父元素，直至最外层的`document`或`window`对象。在此过程中，所有绑定在路径上的父级元素的相同事件监听器都会被依次触发。
