const parent = document.querySelector(".sortable-container");
const divsToSort = document.querySelectorAll(".sort");

divsToSort.forEach((item, i) => {
  //   if (i % 2) {
  const sortable = new Sortable(item, {
    // containment: parent,
    container: "",
    // itemClass: "tahir",
    // draggingClass : "tahir"
    // zoom: 0.5,
    appendableClasses: "sort-container",
  });
  //   }
  //   sortable.disable();
});
