const parent = document.querySelector(".sortable-container");
const divsToSort = document.querySelectorAll(".sort");

divsToSort.forEach((item, i) => {
  //   if (i % 2) {

  const div = document.createElement("div");
  div.classList.add("fallback-element");
  div.innerHTML = "I am tahir";
  div.onclick =() => alert("fallback orignal")

  const sortable = new Sortable(item, {
    // containment: parent,
    container: "",
    // itemClass: "tahir",
    // draggingClass : "tahir",
    // zoom: 0.5,
    appendableClasses: "sort-container",
    fallBackElement: item.classList.contains("fallback") ? div : null,
    // fallBackClone: false,
    onSort: (details) => {
      console.log(details);
    },
  });
  //   }
  //   sortable.disable();
});
