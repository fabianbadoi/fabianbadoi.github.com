class Item {
  constructor(url, tags) {
    this.url = url;
    this.tags = tags.map(str => str.toLowerCase());

    Object.freeze(this);
  }

  toString() {
    return JSON.stringify(this);
  }

  toJSON() {
    return {
      url: this.url,
      tags: this.tags
    };
  }
}

Item.ofString = function (str) {
  return Item.ofObject(JSON.parse(str));
}

Item.ofObject = function (obj) {
  return new Item(obj.url, obj.tags);
}

export default Item;
