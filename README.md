# beautiful-sortable-js
beautiful-sortable-js is a JavaScript library for reorderable drag-and-drop lists.
Demo : https://github.com/tahir150/beautiful-sortable-js/edit/master/README.md
## Getting Started
Install with NPM:
```
$ npm install sortablejs --save
```
Import into your project:
```javascript
import Sortable from 'sortablejs';
```

## Usage
```html5
 <div class="sortable-container">
        <div class="sort">
          <span>Hello I am a Element 1</span>
        </div>
        <div class="sort">
          <span>Hello I am a Element 2</span>
        </div>
        <div class="sort">
          <span>Hello I am a Element 3</span>
        </div>
        <div class="sort">
          <span>Hello I am a Element 4</span>
        </div>
```
```javascript
const elements = document.querySelectorAll(".sort");
divsToSort.forEach((item) => {
  const sortable = new Sortable(item)
})
```
