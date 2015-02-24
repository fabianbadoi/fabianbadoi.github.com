import ItemSet from 'ItemSet.js';
import * as nothing from 'jquery.keyEvents.js';
import parseAndCompile from "CSSFilter.js";

// make sure we have the latest version
window.applicationCache.addEventListener(
  'updateready',
  () => window.location.reload()
);
if(window.applicationCache.status === window.applicationCache.UPDATEREADY) {
  window.location.reload();
}

let items = ItemSet.singleton;

let itemTemplate = _.template($('#template-item').text());
let inputTemplate = _.template($('#template-input').text());
let listTemplate = _.template($('#template-images').text());
let filterTemplate = _.template($('#template-filter').text());
let stageTemplate = _.template($('#template-stage').text());
let mainTemplate = _.template($('#template-main').text());

$(function () {
  $('body').html(mainTemplate({
    filter: filterTemplate(),
    stage: stageTemplate(),
    input: inputTemplate(),
    images: listTemplate({
      items: items.getAll().map(itemTemplate)
    })
  }));
});

$(function() {
  let input = $('#input');
  let stage = $('#stage');
  let stageImg = stage.find('img');
  let stageTagList = stage.find('ul');
  let itemList = $('#items');
  let filterInput = $('#filter');

  let filterStyle = $('#filter-style');

  let saveAndCleanup = (event) => {
    event.preventDefault();
    saveStage();
    cleanup();
  };

  // import, export and clear
  window.ReactiveImages = {
    import(str) {
      ItemSet.ofString(str);
      itemList.html(items.getAll().map(itemTemplate));
    },

    ['export']() {
      document.write(items);
    },

    clear() {
      items.clear();
      window.location.reload();
    },

    // export or clear only the filtered items
    withFilter: {
      ['export']() {
        document.write(items.selectiveToString(getVisibleUrls()));
      },

      clear() {
        let urls = getVisibleUrls();

        items.selectiveClear(urls);
        urls.forEach(removeItemFromDOM);
      }
    }
  };
  console.log(
`Console commands:
  ReactiveImages.export() -> writes export string to document
  ReactiveImages.import(str) -> imports images
  ReactiveImages.clear() -> Deletes all images
  ReactiveImages.withFilter.export() -> exports only images that pass the filter
  ReactiveImages.withFilter.clear() -> removes only images that pass the filter
`);

  // DOM events
  input.on('keyenter', event => { previewItem($.trim($(event.target).val())); addTag(); });
  stage.find('[data-action="add-tag"]').on('click', addTag);
  stage.find('[data-action="save"]').on('click', saveAndCleanup);
  stage.find('ul')
    .on('keyenter', 'li', { ctrlKey: false }, event => {
      event.preventDefault();
      addTag();
    })
    .on('keyenter', 'li', { ctrlKey: true }, saveAndCleanup);

  filterInput.on('keyup', event => filter($.trim($(event.target).val())));

  itemList.on('click', 'li [data-action="remove"]', removeImage);

  function removeImage(event) {
    let target = $(event.target);

    items.removeItem(target.siblings('img').attr('src'));
    target.parent().remove();
  }

  function filter(string) {
    filterStyle.html(parseAndCompile(string));
  }

  function previewItem(url) {
    // clean input
    input.val('');

    // flash area
    stage.addClass('active');

    // setup image and tags
    stageImg.attr('src', url);
  }

  function addTag() {
    let li = $('<li contenteditable="true"></li>');
    stageTagList.append(li);
    li.focus();
  }

  function saveStage() {
    let tags = stageTagList.children().toArray()
      .map(element => $.trim(element.textContent))
      .filter(txt => txt.length);
    let url = stageImg.attr('src');

    let item = items.setItem(url, tags);
    addItemToDOM(item);
  }

  function addItemToDOM(item) {
    itemList.append(itemTemplate(item));
  }

  function removeItemFromDOM(url) {
    itemList.find(`.item[src="${url}"]`).parent().remove();
  }

  function cleanup() {
    stage.removeClass('active');
    stageImg.removeAttr('src');
    stageTagList.children().remove();
  }

  function getVisibleUrls() {
    return itemList.find('.item:visible').toArray()
      .map(item => item.getAttribute('src'))
  }
});
