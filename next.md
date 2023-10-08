React.js 目前是前端开发人员十分流行的 JavaScript 库。它由 Facebook 发明，但作为开源项目提供给世界各地的开发人员和企业使用。

React 真正改变了我们构建单页面应用程序的方式，其中最大的特点之一是函数组件的应用。Hooks 是19年推出的，使我们能够在处理状态时使用函数组件而不是基于类的组件。除了内置的 hooks 外，React 还提供了实现自定义 hooks 的方法。

这里是一些我最喜欢的自定义 hooks 实现，您也可以在自己的应用程序和项目中使用。

## useTimeout
使用这个hooks，我们可以使用声明式方法来实现setTimeout。首先，我们创建一个自定义hooks子，其中包含回调函数和延迟参数。然后，我们使用useRef hooks为回调函数创建一个引用。最后，我们两次使用useEffect，一次用于记住上次的回调函数，一次用于设置超时并清理。

以下是一个计时器的实现示例：
```js
import {useEffect} from 'react'
const useTimeout = (callback,delay)=>{
  const savedCallback=React.useRef();
  useEffect(()=>{
      savedCallback.current=callback
  },[callback]);
  
  useEffect(()=>{
      const tick=()=>{
          savedCallback.current();
      }
      if(delay!==null){
          let id=setTimeout(tick,delay);
          return ()=>clearTimeout(id);
      }
  },[delay])
}
```
## useInterval
如果你想以声明性的方式实现setInterval，你可以使用名为useInterval的hooks。

首先，我们需要创建一个自定义hooks，接受一个回调函数和一个延迟时间作为参数。然后，我们使用useRef为回调函数创建一个ref。最后，我们使用useEffect来记住最新的回调函数，并设置和清除间隔。

该示例展示了自定义ResourceCounter的实现。
```js
import {useRef,useEffect} from 'react';

const useInterval = (callback,delay)=>{
  const savedCallback=React.useRef();
  useEffect(()=>{
      savedCallback.current=callback
  },[callback]);
  
  useEffect(()=>{
      const tick=()=>{
          savedCallback.current();
      }
      if(delay!==null){
          let id=setInterval(tick,delay);
          return ()=>clearInterval(id);
      }
  },[delay])
}
```
