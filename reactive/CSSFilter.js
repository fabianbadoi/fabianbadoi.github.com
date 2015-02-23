import { FilterTypes, parseFilter } from "filter.js";

let hideAll = `
        #items [data-tags] {
          display: none;
        }

`;

function makeSubSelector(node) {
  let base = `[data-tags~="${node.value}"]`;

  if (node.type === FilterTypes.positive) {
    return base;
  } else {
    return `:not(${base})`;
  }
};

function processNodes(rootFilter) {
  let rules;

  switch (rootFilter.type) {
    case FilterTypes.any:
      rules = [];
      break;

    case FilterTypes.or:
      rules = _.flattenDeep(rootFilter.children.map(processNodes));
      break;

    case FilterTypes.and:
    case FilterTypes.positive:
    case FilterTypes.negative:
      let andNodes = [rootFilter, ...rootFilter.children].filter(node =>
        node.type === FilterTypes.positive || node.type === FilterTypes.negative
      );

      let subSelectors = andNodes.map(makeSubSelector).join('');

      rules = [`
        #items ${subSelectors} {
          display: inline-block;
        }

      `];
      break;

    default:
      throw new Erorr(`Invalid filter ${rootFilter.type}.`);
  }

  return rules;
}

function compileFilter(rootNode) {
  let filterRules = processNodes(rootNode);

  if (filterRules.length) {
    return [hideAll, ...filterRules].join('');
  } else {
    return '';
  }
}

export default function parseAndCompile(str) {
  return compileFilter(parseFilter(str));
}
