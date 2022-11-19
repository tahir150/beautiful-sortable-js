const parent = document.querySelector(".sortable-container");
const sections = document.querySelectorAll("section");

// Sample
[].forEach((item, i) => {
  const div = document.createElement("div");
  div.classList.add("fallback-element");
  div.innerHTML = "I am tahir";
  div.onclick = () => alert("fallback orignal");

  const sortable = new Sortable(item, {
    itemClass: "item-class", // class applies to every sortable element
    draggingClass: "dargging", // class will apply when dragging start
    zoom: 1, // it is viewport zoom value (if have css zoom property)
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
  sortable.disable();
});

// Section 1
const section1Divs = sections[0]?.querySelectorAll(".sortable-container .sort");
section1Divs.forEach((item, i) => {
  const div = document.createElement("div");
  div.classList.add("fallback-element");
  div.innerHTML = "I am tahir";
  div.onclick = () => alert("fallback orignal");

  const sortable = new Sortable(item);
});

// Section 2
const section2Divs = sections[1]?.querySelectorAll(".sort");
section2Divs.forEach((item, i) => {
  const sortable = new Sortable(item, {
    containers: "sort-container", // comma seperated appendable boxes classes,
  });
});

// Javascript code viewer
let oldCopiedBtn = null;
const getCopyButton = (textToCopy = "") => {
  const button = document.createElement("button");
  button.classList.add("copy-btn");
  const copyTxt = "copy";
  const copiedTxt = "copied";

  const makeCopyAble = () => {
    button.innerText = copyTxt;
    button.addEventListener("click", copyListener);
  };

  const copyListener = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      button.innerText = copiedTxt;
      button.removeEventListener("click", copyListener);

      setTimeout(() => {
        makeCopyAble();
      }, 1000);
    });
  };
  makeCopyAble();
  return button;
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre code").forEach((el) => {
    const attrCls =
      [...el.classList].find((cl) => cl.includes("bs-")) || "bs-javascript";
    const language = attrCls.split("bs-").pop();
    const code = el.innerHTML;
    const html = Prism.highlight(code, Prism.languages[language], language);
    if (html) {
      el.innerHTML = html;
    }

    const copyBtn = getCopyButton(code);
    el.append(copyBtn);
  });
});
