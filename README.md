# beautiful-sortable-js.
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
    itemClass: "item-class", // class applies to every sortable element
    draggingClass: "dargging", // class will apply when dragging start
    zoom: 0.5, // it is viewport zoom value (if have css zoom property)
    disabledClass: "disabled", // class will apply if sorting is disable
    containers: "sort-container", // comma seperated appendable boxes classes
    fallBackElement: item.classList.contains("fallback") // it is not sortable, it just append this fallback html
      ? `<div class="fallback-element">
         <span>I am fallback</span>
         </div>`
      : null,
    fallBackClone: false, // if will drop a clone of fallback element
    onStart: (startDetail) => {
      // it will trigger when you start sorting
      console.log(startDetail);
    },
    onDrop: (details) => {
      // it will trigger after dropped even it is sorted or not
      console.log(details);
    },
    onSort: (details) => {
      // if element has change or sorted it takes gurantee to trigger after sorting
      console.log(details);
    },
  });
```

Note : In this version, mobile or Touch devices are not supported !
