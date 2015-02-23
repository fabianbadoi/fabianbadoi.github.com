let matchKeyContext = _.curry(function baseMatchKeyboardState(baseContext, event, specificContext) {
  let context = Object.assign({}, baseContext, specificContext);

  return _.pairs(_.pick(event, ['keyCode', 'ctrlKey', 'altKey', 'metaKey', 'shiftKey']))
    .every(([key, val]) => context[key] === undefined || context[key] === val);
});

let matchEnter = matchKeyContext({ keyCode: 13 });

Object.assign(jQuery.event.special, { 'keyenter': {
  delegateType: 'keydown',
  bindType: 'keydown',
  handle: function(event, ...rest) {
    let handler = Object.assign({}, event.handleObj);

    if (matchEnter(event, handler.data)) {
      event.type = handler.origType;
      let ret = handler.handler.call(this, event, ...rest);
      event.type = handler.type;

      return ret;
    }
  }
}});

export default jQuery;
