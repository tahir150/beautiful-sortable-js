const parent = document.querySelector(".sortable-container");
const divsToSort = document.querySelectorAll(".sort");

divsToSort.forEach((item, i) => {
  const div = document.createElement("div");
  div.classList.add("fallback-element");
  div.innerHTML = "I am tahir";
  div.onclick = () => alert("fallback orignal");

  const sortable = new Sortable(item, {
    // itemClass: "item-class", // class applies to every sortable element
    // draggingClass: "dargging", // class will apply when dragging start
    // zoom: 1, // it is viewport zoom value (if have css zoom property)
    // disabledClass: "disabled", // class will apply if sorting is disable
    // containers: "sort-container", // comma seperated appendable boxes classes
    fallBackElement: item.classList.contains("fallback") // it is not sortable, it just append this fallback html
      ? `<div class="fallback-element">
         <span>I am fallback</span>
         </div>`
      : null,
    // fallBackClone: false, // if will drop a clone of fallback element
    // onStart: (startDetail) => {
    //   // it will trigger when you start sorting
    //   console.log(startDetail);
    // },
    // onDrop: (details) => {
    //   // it will trigger after dropped even it is sorted or not
    //   console.log(details);
    // },
    // onSort: (details) => {
    //   // if element has change or sorted it takes gurantee to trigger after sorting
    //   console.log(details);
    // },
  });
  // sortable.disable();
});
