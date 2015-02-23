export let FilterTypes = Object.freeze({
  positive: Symbol('FilterType.posivite'),
  negative: Symbol('FilterType.negative'),
  or: Symbol('FilterType.or'),
  and: Symbol('FilterType.and'),
  any: Symbol('FilterType.any'),

  ofString: str => this[str]
});

class FilterNode {
  constructor(type, { value, children }) {
    Object.assign(this, {
      type: type,
      value: value,
      children: children || []
    });

    Object.freeze(this);
  }
}

FilterNode.ofString = function (str) {
  if (str[0] === '!') {
    return new FilterNode(FilterTypes.negative, { value: str.substring(1) });
  }

  return new FilterNode(FilterTypes.positive, { value: str });
}

export function parseFilter(str) {
  let parts = str.split('|').map(_.trim).filter(_.identity);
  let tokens;

  if (parts.length === 0) {
    return new FilterNode(
      FilterTypes.any,
      {}
    );
  } else if (parts.length === 1) {
    return new FilterNode(
      FilterTypes.and,
      { children: parts[0].split(' ').filter(token => token.length).map(FilterNode.ofString) }
    );
  } else {
    return new FilterNode(
      FilterTypes.or,
      {
        children: parts.map(part => {
          let tokens = part.split(' ').filter(token => _.trim(token).length);

          if (tokens.length > 1) {
            return new FilterNode(
              FilterTypes.and,
              { children: tokens.map(FilterNode.ofString) }
            );
          } else {
            return FilterNode.ofString(tokens[0]);
          }
        })
      }
    );
  }
}
