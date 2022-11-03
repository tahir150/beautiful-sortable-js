const getUtils = function (config) {
  return {
    cssClasses: {
      grabbingClass: "cursor-grabbing",
      noUserSelection: "no-user-selection",
      clonedPreview: "sorting-clone-preview",
      sortingItem: "current-sorting",
      sortable: "sortable",
      containment: "sortable-containment",
    },
    sortableFigures: {
      mouseX: 0,
      mouseY: 0,
      clonedPreview: null,
      sortableParent: null,
      clonedRect: {},
      initial: {
        scrollY: 0,
        scrollX: 0,
        elementPosition: {
          left: 0,
          top: 0,
        },
      },
    },

    injectCss() {
      const existingStyleTag = document.querySelector("[data-sortable-css]");

      if (!existingStyleTag) {
        const css = `
                    .${this.cssClasses.containment} {
                        scroll-behavior: smooth;
                    }
                    .${this.cssClasses.sortable} {
                        cursor: grab;
                    }
                    .${this.cssClasses.sortable}.${this.cssClasses.grabbingClass}:hover {
                    cursor: grabbing;
                    }
                    .${this.cssClasses.noUserSelection} , .${this.cssClasses.noUserSelection} * {
                        user-select: none !important;
                    }
                    .${this.cssClasses.sortingItem} {
                        opacity: 0 !important;
                    }
                      `;

        const style = document.createElement("style");
        style.dataset.sortableCss = true;

        if (style.styleSheet) {
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }

        document.getElementsByTagName("head")[0].appendChild(style);
      }
    },

    getClone(element, containment) {
      const clonedItem = (itemToClone, wrapper) => {
        const itemRect = itemToClone.getBoundingClientRect();
        const clonedItem = itemToClone.cloneNode(true);
        const { top, left } = this.getElementPosition(element, wrapper);
        if (wrapper) {
          wrapper.style.position = "relative";
          clonedItem.style.position = "absolute";
          clonedItem.style.top = top + "px";
          clonedItem.style.left = left + "px";
        } else {
          clonedItem.style.position = "fixed";
          clonedItem.style.top = top + "px";
          clonedItem.style.left = left + "px";
        }

        clonedItem.style.width = itemRect.width + "px";
        clonedItem.style.margin = 0;
        clonedItem.style.boxSizing = "border-box";
        clonedItem.style.userSelect = "none";
        clonedItem.classList.add(this.cssClasses.clonedPreview);
        return clonedItem;
      };

      const clonedPreview = clonedItem(element, containment);
      if (containment) {
        containment.append(clonedPreview);
      } else {
        // else append to first sortable element's parent
        const firstSortable = document.querySelector(
          `.${this.cssClasses.sortable}`
        );
        firstSortable?.after(clonedPreview);
      }
      return clonedPreview;
    },

    getElementPosition(element, wrapper) {
      const elementRect = element.getBoundingClientRect();
      let { y: top, x: left } = elementRect;
      const outline = parseFloat(getComputedStyle(element).outlineWidth);
      if (wrapper) {
        const wrapperRect = wrapper.getBoundingClientRect();
        const scrollTop = wrapper.scrollTop;
        const scrollLeft = wrapper.scrollLeft;
        top = top - wrapperRect.y + scrollTop;
        left = left - wrapperRect.x + scrollLeft;
      }
      if (wrapper && outline) {
        top -= outline;
        left -= outline;
      }
      return { top, left };
    },

    applyInitalClasses(element) {
      element?.classList.add(this.cssClasses.sortable);
      if (config.containment) {
        config.containment.classList.add(this.cssClasses.containment);
      }
    },

    updateClass(element, classToRemove, action = "add") {
      element?.classList[action](classToRemove);
    },

    initMouseDown(event, element, clonedItem) {
      if (element) {
        const scrollParent = config.containment || element.parentElement;
        const scrollTop = scrollParent?.scrollTop;
        const scrollLeft = scrollParent?.scrollLeft;
        const { left, top } = this.getElementPosition(
          element,
          config.containment
        );

        // Ading classes to element
        this.updateClass(element, this.cssClasses.grabbingClass);
        this.updateClass(element, this.cssClasses.sortingItem);
        // Initial values
        this.sortableFigures.sortableParent = scrollParent;
        this.sortableFigures.initial.elementPosition = { left, top };
        this.sortableFigures.initial.scrollY = scrollTop;
        this.sortableFigures.initial.scrollX = scrollLeft;
      }
      if (clonedItem) {
        this.updateClass(clonedItem, this.cssClasses.grabbingClass);
        this.sortableFigures.mouseY = event.pageY;
        this.sortableFigures.mouseX = event.pageX;
      }
      if (config.containment && clonedItem) {
        const parent = config.containment;
        let scrollTop = parent?.scrollTop;
        let scrollLeft = parent?.scrollLeft;
        parent.style.overflowX = "hidden";

        const setPositionByScroll = (e) => {
          const { left: itemLeft, top: itemTop } = clonedItem.style;
          const eventScrollTop = e.target.scrollTop;
          const eventScrollLeft = e.target.scrollLeft;
          const scrollDiffY = eventScrollTop - scrollTop;
          const scrollDiffX = eventScrollLeft - scrollLeft;
          const newTop = parseFloat(itemTop) + scrollDiffY;
          const newLeft = parseFloat(itemLeft) + scrollDiffX;
          clonedItem.style.top = newTop + "px";
          clonedItem.style.left = newLeft + "px";
          scrollTop = eventScrollTop;
          scrollLeft = eventScrollLeft;
        };

        parent.onscroll = setPositionByScroll;
      }
      this.updateClass(document.body, this.cssClasses.noUserSelection);
    },

    movePreview(event) {
      const clonedPreview = this.sortableFigures.clonedPreview;
      const mouseDiffY = this.sortableFigures.mouseY - event.pageY;
      const mouseDiffX = this.sortableFigures.mouseX - event.pageX;
      const { x: itemXDistance, y: itemYDistance } =
        this.sortableFigures.clonedRect;

      const getMousePosition = () => {
        let left = event.pageX / config.zoom - itemXDistance - mouseDiffX;
        let top = event.pageY / config.zoom - itemYDistance - mouseDiffY;

        if (config.containment) {
          const parent = config.containment;
          const parentRect = parent.getBoundingClientRect();
          const scrollTop = parent.scrollTop;
          const scrollLeft = parent.scrollLeft;
          left = left - parentRect.x + scrollLeft;
          top = top - parentRect.y + scrollTop;
          return { left, top };
        }
        return { left, top };
      };

      const { left, top } = getMousePosition();

      clonedPreview.style.left = left + "px";
      clonedPreview.style.top = top + "px";

      // ReAssigning new value to take a difference
      this.sortableFigures.mouseY = event.pageY;
      this.sortableFigures.mouseX = event.pageX;
    },

    terminateMouseDown(element, clonedItem) {
      const transitionDuration = "0.5s";
      const transitionTimeout = parseFloat(transitionDuration) * 1000;
      if (element) {
        // Scrolling into view where user have started sort
        const { scrollY, scrollX } = this.sortableFigures.initial;
        this.sortableFigures.sortableParent.scrollTo({
          top: scrollY,
          left: scrollX,
          behavior: "smooth",
        });

        setTimeout(() => {
          this.updateClass(element, this.cssClasses.grabbingClass, "remove");
          this.updateClass(element, this.cssClasses.sortingItem, "remove");
        }, transitionTimeout);
      } else console.error("element not found !");
      if (clonedItem) {
        this.updateClass(clonedItem, this.cssClasses.grabbingClass, "remove");
        clonedItem.style.transition = `${transitionDuration}`;
        const { top, left } = this.sortableFigures.initial.elementPosition;
        clonedItem.style.top = top + "px";
        clonedItem.style.left = left + "px";
        setTimeout(() => {
          clonedItem.remove();
        }, transitionTimeout);
      } else console.error("cloned not found !");
      if (config.containment) {
        config.containment.onscroll = null;
      }
      this.updateClass(document.body, this.cssClasses.grabbingClass, "remove");
    },
  };
};

function Sortable(element, paramConfig = {}) {
  // throwing error if element is not provided
  if (!element) {
    console.error("Element is not provided !");
    return {};
  }

  // Configs
  const defaultConfig = {
    containment: null,
    zoom: 1,
  };
  const config = {
    ...defaultConfig,
    ...paramConfig,
  };

  //utils
  const utils = getUtils(config);

  // Inecting Css Style to head
  utils.injectCss();
  utils.applyInitalClasses(element);

  // Sortable Functionality
  const onMouseMove = (e) => {
    e.stopPropagation();
    utils.movePreview(e);
  };

  const onMouseDown = (e) => {
    e.stopPropagation();
    // getting clone of Element to it's position for preview
    const clonedPreview = utils.getClone(element, config.containment);
    utils.sortableFigures.clonedPreview = clonedPreview;
    const clonedRect = clonedPreview.getBoundingClientRect();
    clonedRect.x = e.pageX / config.zoom - clonedRect.x;
    clonedRect.y = e.pageY / config.zoom - clonedRect.y;
    utils.sortableFigures.clonedPreview = clonedPreview;
    utils.sortableFigures.clonedRect = clonedRect;
    // initial mousedown configurations
    utils.initMouseDown(e, element, clonedPreview);
    // then start moving it following mouse position
    document.addEventListener("mousemove", onMouseMove);
    // adding mouseup listener
    document.addEventListener("mouseup", removeListeners);
  };

  const removeListeners = (e) => {
    e.stopPropagation();
    utils.terminateMouseDown(element, utils.sortableFigures.clonedPreview);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", removeListeners);
  };

  // Attaching Main Listener
  element.addEventListener("mousedown", onMouseDown);

  // Methods
  this.disable = function (disable = true) {
    if (element) {
      if (disable) {
        element.removeEventListener("mousedown", onMouseDown);
        element.classList.remove(utils.cssClasses.sortable);
      } else {
        element.addEventListener("mousedown", onMouseDown);
        element.classList.add(utils.cssClasses.sortable);
      }
    } else {
      console.error(
        "Unable to disable because the  element you are trying to disable is not sortable"
      );
    }
  };
}
