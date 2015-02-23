let url = Symbol('url');
let tags = Symbol('tags');

class Item {
  constructor(uurl, ttags) {
    this[url] = uurl;
    this[tags] = ttags.map(str => str.toLowerCase());

    Object.freeze(this);
  }

  get url() {
    return this[url];
  }

  get tags() {
    return this[tags];
  }

  toString() {
    return JSON.stringify({
      url: this.url,
      tags: this.tags
    });
  }
}

Item.ofString = function (str) {
  return Item.ofObject(JSON.parse(str));
}

Item.ofObject = function (obj) {
  return new Item(obj.url, obj.tags);
}

export default Item;
