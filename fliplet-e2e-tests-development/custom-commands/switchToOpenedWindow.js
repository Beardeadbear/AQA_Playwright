exports.command = function(){
  return this
    .windowHandle(result =>
      this.windowHandles(handles =>
        this
          .closeWindow(result.value)
          .switchWindow(handles.value.filter(a => a !== result.value)[0])
      ));
};