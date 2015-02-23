import Item from "Item.js";

let items = Symbol('items');
let storage = Symbol('storage');
let getLiveItems = Symbol('getLiveItems');
let saveItem = Symbol('saveItem');

let keyPrefix = 'ItemSet:item:';
let keyPattern = new RegExp(keyPrefix);

let singleton;

class ItemSet {
  constructor() {
    this[storage] = localStorage;

    this[items] = this[getLiveItems]();
  }

  setItem(url, tags) {
    let item = new Item(url, tags);

    this[items][item.url] = item;
    this[saveItem](item);

    return item;
  }

  removeItem(url) {
    delete this[items][url];
    this[storage].removeItem(keyPrefix + url);
  }

  getItem(url) {
    return this[items][url];
  }

  getAll() {
    return _.toArray(this[items]);
  }

  *[Symbol.iterator]() {
    let keys = Object.keys(this[items]);

    for (let key of keys) {
      yield [ key, this[items][key] ];
    }
  }

  [saveItem](item) {
    this[storage].setItem(keyPrefix + item.url, item);
  }

  [getLiveItems]() {
    let store = this[storage];

    return _.range(this[storage].length).reduce((items, index) => {
      let key = store.key(index);

      if (keyPattern.test(key)) {
      	let item = Item.ofString(store.getItem(key));

      	items[item.url] = item;
      }

      return items;
    }, {});
  }
}

export default { get singleton() { return singleton = singleton || new ItemSet(); }};
