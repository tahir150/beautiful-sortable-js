const parent = document.querySelector(".sortable-container");
const divsToSort = document.querySelectorAll(".sort");

divsToSort.forEach((item) => {
  const sortable = new Sortable(item, {
    containment: parent,
  });
//   sortable.disable();
});
