const parent = document.querySelector(".sortable-container");
const divsToSort = document.querySelectorAll(".sort");

divsToSort.forEach((item, i) => {
  const div = document.createElement("div");
  div.classList.add("fallback-element");
  div.innerHTML = "I am tahir";
  div.onclick = () => alert("fallback orignal");

  const sortable = new Sortable(item, {
    // containment: parent,
    // itemClass: "tahir",
    // draggingClass : "tahir",
    // zoom: 0.5,
    // disabledClass : "",
    containers: "sort-container",
      fallBackElement: item.classList.contains("fallback")
        ? `<div class="fallback-element">
      <span>F - Hello I am a Element 10</span>
    </div>`
        : null,
    // fallBackClone: false,
    onSort: (details) => {
      console.log(details);
    },
  });
    // sortable.disable();
});
