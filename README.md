#sortable-js
beautiful-sortable-js is a JavaScript library for reorderable drag-and-drop lists.
Demo : https://github.com/tahir150/beautiful-sortable-js/edit/master/README.md

## Getting Started
Install with NPM:
```
$ npm install beautiful-sortable-js --save
```
Import into your project:
```javascript
import Sortable from 'sortablejs';
```

## Usage
```html
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
  </div>
```
```javascript
 const elements = document.querySelectorAll(".sort");
 divsToSort.forEach((item) => {
   const sortable = new Sortable(item)
 });
```

## Options
Options object can be assign by giving second argument.
```javascript
  const sortable = new Sortable(item, {
    containment: parent,
    itemClass: "tahir",
    draggingClass: "tahir",
    zoom: 0.5,
    disabledClass: "",
    containers: "sort-container",
    fallBackElement: item.classList.contains("fallback")
      ? `<div class="fallback-element">
          <span>F - Hello I am a Element 10</span>
         </div>`
      : null,
    fallBackClone: false,
    onSort: (details) => {
      console.log(details);
    },
  });
```

In this version, mobile or Touch devices are not supported !
