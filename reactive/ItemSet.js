import Item from "Item.js";

let items = Symbol('items');
let storage = Symbol('storage');
let getLiveItems = Symbol('getLiveItems');
let saveItem = Symbol('saveItem');

let keyPrefix = 'ItemSet:item:';
let keyPattern = new RegExp(keyPrefix);

let singleton;
let safeConstruct = false;

export default class ItemSet {
  constructor() {
    // prevent direct calls to the constructor
    if (!safeConstruct) {
      throw new Error('You must use ItemSet.singleton() to create an ItemSet.');
    }

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

  clear() {
    _.each(this[items], (item, url) => this.removeItem(url));
  }

  toJSON() {
    return this[items];
  }

  toString() {
    return JSON.stringify(this);
  }

  selectiveClear(urls) {
    _.each(this[items], item => {
      if (urls.indexOf(item.url) >= 0) {
        this.removeItem(item.url);
      }
    });
  }

  selectiveToString(urls) {
    return JSON.stringify(_.reduce(this[items], (filtered, item) => {
      if (urls.indexOf(item.url) >= 0) {
        filtered[item.url] = item;
      }

      return filtered;
    }, {}));
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

Object.assign(ItemSet, {
  ofString(str) {
    let items = _.toArray(JSON.parse(str));
    let set = ItemSet.singleton;

    items.forEach(item => set.setItem(item.url, item.tags));

    return set;
  },

  get singleton() {
    safeConstruct = true;

    if (!singleton) {
      singleton = new ItemSet();
    }
    let instance = singleton;

    safeConstruct = false;

    return instance;
  }
});
