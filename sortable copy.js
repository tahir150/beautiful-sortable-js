// helper functions
const getClone = (itemToClone, wrapper) => {
    const itemRect = itemToClone.getBoundingClientRect();
    const clonedItem = itemToClone.cloneNode(true);
    if (wrapper) {
        let wrapperRect = wrapper.getBoundingClientRect();
        clonedItem.style.position = "absolute";
        clonedItem.style.top =
            itemRect.top - (wrapperRect.y - wrapper.scrollTop) - 1.5 + "px";
        clonedItem.style.left = itemRect.left - wrapperRect.x - 1.5 + "px";
    } else {
        clonedItem.style.position = "fixed";
        clonedItem.style.top = itemRect.y + "px";
        clonedItem.style.left = itemRect.x + "px";
    }

    clonedItem.style.width = itemRect.width + "px";
    // clonedItem.style.pointerEvents = "none";
    clonedItem.style.margin = 0;
    clonedItem.style.zIndex = 1000;
    clonedItem.style.boxSizing = "border-box";
    clonedItem.classList.add("cloned");
    clonedItem.classList.remove("grab");
    return clonedItem;
};
let onsortTimeout;

const getItemDetail = (item) => {
    const parent = item.parentNode;
    const index = Array.from(parent.children).indexOf(item);
    const detail = { itemId: item.id, index, parent: parent.id };
    return JSON.parse(JSON.stringify(detail));
};

const anyChange = (obj1, obj2) => {
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
};

const removeInsidePrewiewClass = () => {
    const insideClass = document.querySelector(".drop-inside");
    if (insideClass) {
        insideClass.classList.remove("drop-inside");
    }
};

// Main Sorting function
const sortable = ({
    item,
    onsort = () => { },
    appendable = document.getElementById("dropzone"),
    appendableGridClass,
}) => {
    let itemDiffY = null;
    let itemDiffX = null;
    let pointerDiffY = null;
    let clonedItem = null;
    let layerTarget = null;
    let startedFrom = {};
    let endedOn = {};

    let zoom = getComputedStyle(appendable).zoom;

    const anchorTags = item.querySelectorAll("a");
    if (anchorTags) {
        anchorTags.forEach((a) => {
            a.draggable = false;
        });
    }

    function mousemove(evt) {
        let dropzoneRect = appendable.getBoundingClientRect();
        const { pageX, pageY } = evt;
        const zoomedPageX = pageX / zoom;
        const zoomedPageY = pageY / zoom;
        clonedItem.style.top =
            zoomedPageY - itemDiffY - (dropzoneRect.y - appendable.scrollTop) + "px";
        clonedItem.style.left = zoomedPageX - itemDiffX - dropzoneRect.x + "px";
        clonedItem.style.opacity = 0.8;
        item.style.opacity = 0.6;
        document.body.classList.add("cursor-grabbing");
        // Getting Dom Element by x and y axis
        // Real target
        const realTarget = document.elementFromPoint(pageX, pageY);
        // Layer target
        layerTarget = document.elementFromPoint(pageX, pageY);
        if (layerTarget && !layerTarget.classList.contains("cs-layer")) {
            layerTarget = layerTarget.closest(".cs-layer");
        }
        // here start sorting
        if (
            layerTarget &&
            !layerTarget.classList.contains("no-drop") &&
            appendable.contains(layerTarget)
        ) {
            // element height calculation
            const rect = layerTarget.getBoundingClientRect();
            const middleY = rect.y + rect.height / 2;

            // For Appending into grid
            const dragDiffY = pageY - pointerDiffY;
            if (
                appendableGridClass &&
                realTarget.classList.contains(appendableGridClass)
            ) {
                // Appending element if dragged inside grid items
                realTarget.append(item);
                removeInsidePrewiewClass();
                realTarget.classList.add("drop-inside");

                // setTimeout(() => {
                //   realTarget.parentNode.classList.remove("default-height");
                //   realTarget.classList.remove("default-height");
                // }, 150);
            } else {
                removeInsidePrewiewClass();
                // SORTING
                if (middleY < zoomedPageY) {
                    layerTarget.after(item);
                } else {
                    layerTarget.before(item);
                }
            }
            pointerDiffY = evt.pageY;
            replacedWith = layerTarget;
        }
    }

    item.addEventListener("mousedown", function (evt) {
        evt.stopPropagation();
        if (
            !evt.target.classList.contains("grid-resizer") &&
            !item.classList.contains("canDrop")
        ) {
            zoom = getComputedStyle(appendable).zoom;
            dropzoneRect = appendable.getBoundingClientRect();
            clonedItem = getClone(item, appendable); // dropzone is a wrapper for absolute element
            appendable.append(clonedItem);
            item.classList.add("no-drop");
            document.body.classList.add("no-user-select");
            const { top, left } = clonedItem.getBoundingClientRect();
            itemDiffY = evt.pageY / zoom - top;
            itemDiffX = evt.pageX / zoom - left;
            pointerDiffY = evt.pageY;
            startedFrom = getItemDetail(item);
            document.addEventListener("mousemove", mousemove);

            // On Mouse up cleaning Listeners and calling callbacks
            const mouseup = (evt) => {
                document.removeEventListener("mousemove", mousemove);
                document.body.classList.remove("no-user-select");
                document.body.classList.remove("cursor-grabbing");
                item.style.opacity = "";
                if (clonedItem) {
                    clonedItem.remove();
                }
                removeInsidePrewiewClass();
                item.classList.remove("no-drop");
                document.removeEventListener("mouseup", mouseup);
                endedOn = getItemDetail(item);

                if (anyChange(startedFrom, endedOn)) {
                    const itemDetails = { startedFrom, endedOn };
                    const appendedItem = document.getElementById(endedOn.itemId);
                    const appendedItemParent = appendedItem.parentNode;
                    appendedItem
                        .closest(".default-height")
                        ?.classList.remove("default-height");
                    // appendedItemParent.classList.remove("default-height");
                    clearTimeout(onsortTimeout);
                    onsortTimeout = setTimeout(() => {
                        onsort(itemDetails);
                    }, 250);
                }
            };
            document.addEventListener("mouseup", mouseup);
        }
    });
};
