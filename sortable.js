const getUtils = function (config = {}) {
  // first checking if all configs are valid
  const throwError = (message) => {
    const error = new Error(message);
    error.name = "Sortable JS";
    throw error;
  };

  // Checking if not an error
  if (false) {
    throwError("error");
  }

  return {
    cssClasses: {
      grabbingClass: "cursor-grabbing",
      noUserSelection: "no-user-selection",
      sortingItem: "current-sorting",
      clonedPreview: "sorting-clone-preview",
      cloneMoving: "clone-moving",
      cloned: "cloned",
      sortMoving: "sort-moving",
      sortable: "sortable",
      containment: "sortable-containment",
      appendableClasss: "sort-appendable",
      defaultHeight: "default-height",
      fallBackElement: "fallback-element",
      fallBackPreview: "fallback-preview",
      fallBackClone: "fallback-clone",
    },
    sortableFigures: {
      mouseX: 0,
      mouseY: 0,
      windowScroll: {
        x: 0,
        y: 0,
      },
      clonedPreview: null,
      sortableParent: null,
      orignalFallback: null,
      fallBackElement: null,
      fallBackClone: null,
      preventedContainerClasses: [],
      cloneDistance: {
        y: 0,
        x: 0,
      },
      initial: {
        scrollY: 0,
        scrollX: 0,
        elementPosition: {
          left: 0,
          top: 0,
        },
      },
      itemDetails: {
        startedFrom: {},
        endedOn: {},
      },
    },
    zoomedValue: 1,

    injectCss() {
      const existingStyleTag = document.querySelector("[data-sortable-css]");

      if (!existingStyleTag) {
        const css = `.${this.cssClasses.containment} {scroll-behavior: smooth;}.${this.cssClasses.sortable} {touch-action:none;}.${this.cssClasses.sortable} , .${this.cssClasses.sortable}:hover {    cursor: grab;}.${this.cssClasses.sortable}.${this.cssClasses.grabbingClass}:hover {    cursor: grabbing;}.${this.cssClasses.noUserSelection} , .${this.cssClasses.noUserSelection} * {    user-select: none !important;}.${this.cssClasses.sortMoving} {    background: #00000094 !important;    opacity: 0.5;}.${this.cssClasses.sortMoving} *{    opacity: 0 !important;}.${this.cssClasses.cloneMoving} {    opacity: 0.7;}.${this.cssClasses.appendableClasss} {  border: solid 1px gray;}.${this.cssClasses.defaultHeight} , .${this.cssClasses.containment} {  padding: 8px;}`;

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

    getClone(element) {
      const clonedItem = (itemToClone) => {
        const itemRect = itemToClone.getBoundingClientRect();
        const clonedItem = itemToClone.cloneNode(true);
        const { top, left } = this.getElementPosition(element);

        clonedItem.style.position = "fixed";
        clonedItem.style.top = top + "px";
        clonedItem.style.left = left + "px";

        clonedItem.style.width = itemRect.width + "px";
        clonedItem.style.margin = 0;
        clonedItem.style.zIndex = 1000;
        clonedItem.style.pointerEvents = "none";
        clonedItem.style.boxSizing = "border-box";
        clonedItem.style.userSelect = "none";
        this.updateClass(clonedItem, this.cssClasses.clonedPreview);
        this.updateClass(clonedItem, config.draggingClass);
        return clonedItem;
      };

      const clonedPreview = clonedItem(element);
      // else append to first sortable element's parent
      element?.after(clonedPreview);
      return clonedPreview;
    },

    getZoomedValue() {
      const z = +(
        config.zoom ||
        (config.zoomedElement && getComputedStyle(config.zoomedElement).zoom) ||
        1
      );
      this.zoomedValue = z;
      return z;
    },

    throwError(e) {
      console.error(new Error(e));
    },

    getItemDetail(element) {
      const parent = element.parentNode;
      if (!element || !parent) {
        return {};
      }
      const index = Array.from(parent.children).indexOf(element);
      const detail = { element, index, parent };
      return detail;
    },

    anyChange({ startedFrom, endedOn }) {
      let isAnyChange = false;
      Object.keys(startedFrom).forEach((key) => {
        if (startedFrom[key] !== endedOn[key]) {
          isAnyChange = true;
        }
      });
      return isAnyChange;
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

    handleDefaultHeight(element) {
      if (element) {
        const shouldShowHeight =
          parseInt(getComputedStyle(element).height) < 30;
        if (shouldShowHeight) {
          this.updateClass(element, this.cssClasses.defaultHeight);
        }
      }
    },

    setInitalData(element) {
      this.updateClass(element, this.cssClasses.sortable);
      this.updateClass(element, config.itemClass);
      const scrollParent =
        element.closest("." + this.cssClasses.appendableClasss) ||
        element.parentElement;

      if (scrollParent) {
        this.sortableFigures.sortableParent = scrollParent;
        this.updateClass(scrollParent, this.cssClasses.containment);
      }

      if (config.containers) {
        if (typeof config.containers === "string") {
          config.containers.split(",").forEach((cls) => {
            document.querySelectorAll("." + cls).forEach((el) => {
              this.updateClass(el, this.cssClasses.appendableClasss);
              this.handleDefaultHeight(el);
            });
          });
        }
      }

      if (config.preventedContainers) {
        const containers = config.preventedContainers.split(",");
        containers.forEach((cls) =>
          this.sortableFigures.preventedContainerClasses.push(cls.trim())
        );
      }

      let fallBackElement = config.fallBackElement;
      if (fallBackElement) {
        if (typeof fallBackElement === "string") {
          const div = document.createElement("div");
          div.innerHTML = fallBackElement;
          fallBackElement = div.childNodes[0];
        }
        try {
          fallBackElement.classList.add(this.cssClasses.fallBackPreview);
          this.sortableFigures.orignalFallback = fallBackElement;
        } catch (e) {
          this.throwError("Please enter valid html for fallback Element");
        }
      }
    },

    updateClass(element, cssClass, action = "add") {
      if (cssClass) {
        element?.classList[action](cssClass);
      }
    },

    initMouseDown(event, element, clonedItem) {
      if (element) {
        // Ading classes to element
        const startFrom = this.getItemDetail(element);
        this.updateClass(element, this.cssClasses.grabbingClass);
        this.updateClass(element, this.cssClasses.sortingItem);
        // Initial element's position
        this.updateElementsInitialPosition(element);
        this.sortableFigures.itemDetails.startedFrom = startFrom;
        config.onStart({ startFrom });
      }
      if (clonedItem) {
        this.updateClass(clonedItem, this.cssClasses.grabbingClass);
        this.sortableFigures.mouseY = event.pageY;
        this.sortableFigures.mouseX = event.pageX;
        // getting initial body scroll
        this.sortableFigures.windowScroll = {
          x: window.scrollX,
          y: window.scrollY,
        };
      }

      this.updateClass(document.body, this.cssClasses.noUserSelection);
    },

    updateElementsInitialPosition(element) {
      const scrollTop = this.sortableFigures.sortableParent?.scrollTop;
      const scrollLeft = this.sortableFigures.sortableParent?.scrollLeft;
      this.sortableFigures.initial.scrollY = scrollTop;
      this.sortableFigures.initial.scrollX = scrollLeft;
    },

    windowScrollIdNeeded({ clientX, clientY }) {
      const { innerHeight, innerWidth } = window;
      const topBoundariesTouched = clientY < 50;
      const bottomBoundariesTouched = clientY > innerHeight - 50;
      if (topBoundariesTouched || bottomBoundariesTouched) {
        if (!this.interval) {
          const scrollYTo = topBoundariesTouched ? -50 : 50;
          this.interval = setInterval(() => {
            window.scrollTo(0, window.scrollY + scrollYTo);
          }, 50);
        }
      }
      if (!topBoundariesTouched && !bottomBoundariesTouched) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },

    interval: null,

    movePreview({ event }) {
      const { pageY, pageX } = event;
      const clonedPreview = this.sortableFigures.clonedPreview;
      const mouseDiffY = this.sortableFigures.mouseY - pageY;
      const mouseDiffX = this.sortableFigures.mouseX - pageX;
      let { y, x } = this.sortableFigures.cloneDistance;

      // if Scroll has change, add to element's position
      const currentScrollX = window.scrollX;
      const currentScrollY = window.scrollY;
      const { x: initSx, y: initSy } = this.sortableFigures.windowScroll;

      if (currentScrollX !== initSx) {
        const xDiff = currentScrollX - initSx;
        this.sortableFigures.windowScroll.x = currentScrollX;
        x = x - xDiff;
      }
      if (currentScrollY !== initSy) {
        const yDiff = currentScrollY - initSy;
        y = y + yDiff;
      }

      let left = pageX / this.zoomedValue - mouseDiffX;
      let top = pageY / this.zoomedValue - mouseDiffY;

      clonedPreview.style.left = left - x + "px";
      clonedPreview.style.top = top - y + "px";

      // ReAssigning new value to take a difference
      this.sortableFigures.mouseY = pageY;
      this.sortableFigures.mouseX = pageX;
      this.windowScrollIdNeeded(event);
    },

    sortElement({ event, sortingElement, path }) {
      const { clientX: pageX, clientY: pageY } = event;
      // const pointElements = [...path].splice(0, path.length - 2);
      const pointElements = document.elementsFromPoint(pageX, pageY);
      const cssClasses = this.cssClasses;

      const isHaveThisAppendable = (parent, child) => {
        return parent === child?.parentElement;
      };

      const pointedElement = pointElements[0];

      const isSortableElement =
        !pointedElement?.classList.contains(cssClasses.sortingItem) &&
        !pointedElement?.closest("." + cssClasses.sortingItem) &&
        pointedElement?.classList.contains(cssClasses.sortable);

      //<== CONTAINMENT CODE
      const sortableContainment = pointElements.find((el) =>
        el?.classList.contains(cssClasses.containment)
      );
      const configContainment = pointElements.find(
        (el) =>
          el?.classList.contains(cssClasses.appendableClasss) &&
          !el?.classList.contains(cssClasses.clonedPreview)
      );

      const appendableContainment = configContainment || sortableContainment;

      /// <== GET FALLBACK ELEMENT CODE
      const getFallbackElement = () => {
        const fallbackEle = this.sortableFigures.orignalFallback;
        if (fallbackEle) {
          // if any fallback element than remove it and below add new one
          const lastEle = this.sortableFigures.fallBackElement;
          if (
            lastEle?.classList.contains(cssClasses.fallBackPreview) &&
            this.sortableFigures.itemDetails.startedFrom.parent ===
              appendableContainment
          ) {
            lastEle.remove();
          }

          if (config.fallBackClone) {
            const lastCloned = this.sortableFigures.fallBackClone;
            const canClone = !lastCloned?.classList.contains(
              cssClasses.fallBackClone
            );

            if (canClone) {
              const clone = fallbackEle.cloneNode(true);
              this.sortableFigures.fallBackClone = clone;
              this.sortableFigures.fallBackElement = clone;
              this.updateClass(clone, cssClasses.fallBackClone);
              return clone;
            } else {
              return lastCloned;
            }
          }

          this.sortableFigures.fallBackElement = fallbackEle;
          return fallbackEle;
        }
        return false;
      };

      const fallBackElement = getFallbackElement();
      const fallbackRequirementsMeet = () => {
        if (fallBackElement) {
          if (
            this.sortableFigures.itemDetails.startedFrom.parent !==
            appendableContainment
          ) {
            return true;
          }
        }
      };
      /// <== GET FALLBACK ELEMENT CODE END

      const appendableHandler = () => {
        // First checking if not prevented
        let isPrevented = false;
        this.sortableFigures.preventedContainerClasses.forEach((cls) => {
          if (appendableContainment.classList.contains(cls)) {
            isPrevented = true;
          }
        });

        const appendElement = (appendable) => {
          if (!isPrevented) {
            const eleToAppend = appendable || sortingElement;
            const canAppendToThisContainer =
              appendableContainment !== eleToAppend &&
              !appendableContainment.classList.contains(
                cssClasses.clonedPreview
              ) &&
              eleToAppend.closest("." + cssClasses.appendableClasss) !==
                appendableContainment;
            if (
              !isHaveThisAppendable(appendableContainment, eleToAppend) &&
              canAppendToThisContainer
            ) {
              appendableContainment.append(eleToAppend);
            }
          }
        };
        // if any fallback element is present then check if same container
        if (fallBackElement) {
          if (fallbackRequirementsMeet()) {
            appendElement(fallBackElement);
          }
          // else it can append or sort anywhere
        } else if (configContainment) {
          const configClasses = config.containers.split(",");
          const containmentClasses = configContainment.classList;
          let canAppend = false;
          for (let i = 0; i < configClasses.length; i++) {
            if (containmentClasses.contains(configClasses[i].trim())) {
              canAppend = true;
              break;
            }
          }
          if (canAppend) {
            appendElement();
          }
        } else {
          appendElement();
        }
      };
      //<== CONTAINMENT CODE

      // SORTING AND APPENDING CODE
      // <== Sortable Functionality
      const sortTheElement = () => {
        let isPrevented = false;
        this.sortableFigures.preventedContainerClasses.forEach((cls) => {
          const preventedParent = pointedElement.closest(
            "." + cssClasses.containment
          );
          if (
            preventedParent?.classList.contains(cls) &&
            preventedParent !== sortingElement.parentElement
          ) {
            isPrevented = true;
          }
        });

        const sortElement = (sortable) => {
          if (!isPrevented) {
            const eleToSort = sortable || sortingElement;
            const elementRect = pointedElement.getBoundingClientRect();
            const elementMiddleY = elementRect.y + elementRect.height / 2;
            const notInnerConntainment = !pointedElement.classList.contains(
              // preventing for inner containment, it will control itself below
              cssClasses.appendableClasss
            );

            if (notInnerConntainment) {
              if (elementMiddleY < pageY / this.zoomedValue) {
                pointedElement.after(eleToSort);
              } else {
                pointedElement.before(eleToSort);
              }
            } else return true;
          }
        };

        // If fallback then not for same parent
        if (fallBackElement) {
          if (fallbackRequirementsMeet()) {
            const reVal = sortElement(fallBackElement);
            if (reVal) return true;
          }
          // else it can append or sort anywhere
        } else if (configContainment) {
          if (config.containers) {
            const reVal = sortElement();
            if (reVal) return true;
          }
        } else {
          const reVal = sortElement();
          if (reVal) return true;
        }
      };
      // <== Sortable Functionality Ends

      // <== Appendable Functionality
      if (appendableContainment) {
        if (configContainment) {
          const callAppend = () => {
            if (config.containers) {
              appendableHandler();
            }
          };
          // inner containment
          const boundaryGap = 10;
          const { top, bottom } = configContainment.getBoundingClientRect();
          const hittedTop = pageY >= top && pageY < top + boundaryGap;
          const hittedBottom = pageY <= bottom && pageY > bottom - boundaryGap;
          const touchingBoundaries = hittedTop || hittedBottom;

          if (isSortableElement) {
            if (touchingBoundaries) {
              const isNotEmpty = configContainment.querySelector(
                "." + cssClasses.sortable
              );
              // if not empty then run thouching boundaries code
              if (isNotEmpty) {
                let isPrevented = false;
                this.sortableFigures.preventedContainerClasses.forEach(
                  (cls) => {
                    if (configContainment?.classList.contains(cls)) {
                      isPrevented = true;
                    }
                  }
                );
                if (!isPrevented) {
                  if (!fallBackElement) {
                    if (
                      configContainment.parentElement.classList.contains(
                        cssClasses.appendableClasss
                      )
                    ) {
                      if (hittedTop) {
                        configContainment.before(sortingElement);
                      } else {
                        configContainment.after(sortingElement);
                      }
                    }
                  }
                }
              }
            } else {
              const notSorted = sortTheElement();
              if (notSorted && !touchingBoundaries) {
                callAppend();
              }
            }
          } else {
            callAppend();
          }
        } else {
          // Outer containment
          if (isSortableElement) {
            // outside container + sortable
            sortTheElement();
          } else {
            // outside container
            appendableHandler();
          }
        }
      }
      // <== Appendable Functionality Ends
      // SORTING AND APPENDING CODE  ENDED !
    },

    terminateMouseDown(element, clonedItem) {
      const transitionDuration = "0.15s";
      const transitionTimeout = parseFloat(transitionDuration) * 1000;
      if (element) {
        // Scrolling into view where user have started sort
        const { scrollY, scrollX } = this.sortableFigures.initial;
        this.sortableFigures.sortableParent.scrollTo({
          top: scrollY,
          left: scrollX,
          behavior: "smooth",
        });

        clearInterval(this.interval);
        this.interval = null;

        const isFallbackElement = this.sortableFigures.fallBackElement;
        if (isFallbackElement) {
          const endedItemDetail = this.getItemDetail(
            this.sortableFigures.fallBackElement
          );
          this.sortableFigures.itemDetails.endedOn = endedItemDetail;
          this.sortableFigures.fallBackElement = null;
          this.sortableFigures.fallBackClone = null;
        } else {
          this.sortableFigures.itemDetails.endedOn =
            this.getItemDetail(element);
        }

        setTimeout(() => {
          this.updateClass(element, this.cssClasses.grabbingClass, "remove");
          this.updateClass(element, this.cssClasses.sortingItem, "remove");
        }, transitionTimeout);
      } else console.error("element not found !");
      if (clonedItem) {
        this.updateClass(clonedItem, this.cssClasses.grabbingClass, "remove");
        clonedItem.style.transition = `${transitionDuration}`;
        const { top, left } = this.getElementPosition(
          element,
          config.containment
        );
        const { width: eleWidth, height: eleHeight } =
          getComputedStyle(element);
        clonedItem.style.top = top + "px";
        clonedItem.style.left = left + "px";
        clonedItem.style.width = eleWidth;
        clonedItem.style.height = eleHeight;
        setTimeout(() => {
          clonedItem.remove();
          this.updateClass(element, this.cssClasses.sortMoving, "remove");
        }, transitionTimeout);
      } else console.error("cloned not found !");
      if (config.containment) {
        config.containment.onscroll = null;
      }
      const { itemDetails } = this.sortableFigures;
      if (itemDetails.endedOn?.element && this.anyChange(itemDetails)) {
        config.onSort(itemDetails);
      }
      config.onDrop(itemDetails);
      this.updateClass(
        document.body,
        this.cssClasses.noUserSelection,
        "remove"
      );

      if (config.fallBackElement) {
        this.sortableFigures.fallBackClone?.classList.remove(
          this.cssClasses.fallBackClone
        );
      }
    },
  };
};

function Sortable(element, paramConfig = {}) {
  // throwing error if element is not provided
  if (!element) {
    console.error("Element is not provided !");
    return {};
  } else if (element.closest("pre")) {
    return {
      disable() {},
    };
  }

  // Configs
  const defaultConfig = {
    containment: null,
    zoom: undefined,
    fallBackClone: true,
    zoomedElement: null,
    onStart: () => {},
    onSort: () => {},
    onDrop: () => {},
    itemClass: "",
    draggingClass: "",
    containers: "",
    disabledClass: "",
    preventedContainers: "",
  };
  const config = {
    ...defaultConfig,
    ...paramConfig,
  };

  //utils
  const utils = getUtils(config);
  // Inecting Css Style to head
  utils.injectCss();
  utils.setInitalData(element);

  // Sortable Functionality
  const onMouseDown = (e) => {
    if (e.which === 1) {
      e.stopPropagation();
      // getting clone of Element to it's position for preview
      utils.getZoomedValue();

      const clonedPreview = utils.getClone(element);
      utils.sortableFigures.clonedPreview = clonedPreview;
      const distance = {};
      const { pageX, pageY } = e;
      const item = e.currentTarget;
      const { x: itemX, y: itemY } = item.getBoundingClientRect();
      distance.y = pageY / utils.zoomedValue - itemY;
      distance.x = pageX / utils.zoomedValue - itemX;
      utils.sortableFigures.cloneDistance = distance;
      // initial mousedown configurations
      utils.initMouseDown(e, element, clonedPreview);
      // then start moving it following mouse position
      document.addEventListener("mousemove", onMove);
      document.addEventListener("touchmove", onMove); // touch
      // adding mouseup listener
      document.addEventListener("mouseup", removeListeners);
      document.addEventListener("touchend", removeListeners); // touch
    }
  };

  const onMove = (e) => {
    const isTouched = e.type === "touchmove";
    e.stopPropagation();
    utils.updateClass(
      utils.sortableFigures.clonedPreview,
      utils.cssClasses.cloneMoving
    );
    utils.updateClass(element, utils.cssClasses.sortMoving);
    if (isTouched) {
      const targetTouch = e.targetTouches[0];
      utils.movePreview({
        event: targetTouch,
      });
      utils.sortElement({
        event: targetTouch,
        sortingElement: element,
        path: e.path,
      });
    } else {
      utils.movePreview({ event: e });
      utils.sortElement({
        event: e,
        sortingElement: element,
        path: e.path,
      });
    }
    utils.updateElementsInitialPosition(element);
  };

  const removeListeners = (e) => {
    e.stopPropagation();
    utils.terminateMouseDown(element, utils.sortableFigures.clonedPreview);
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("mouseup", removeListeners);
  };

  // Attaching Main Listener
  element.addEventListener("pointerdown", onMouseDown); // touch , mouse

  // Methods
  this.disable = function (disable = true) {
    if (element) {
      if (disable) {
        element.removeEventListener("pointerdown", onMouseDown);
        element.classList.remove(utils.cssClasses.sortable);
        if (config.disabledClass) {
          element.classList.add(config.disabledClass);
        }
      } else {
        element.addEventListener("pointerdown", onMouseDown);
        element.classList.add(utils.cssClasses.sortable);
        if (config.disabledClass) {
          element.classList.remove(config.disabledClass);
        }
      }
    } else {
      console.error(
        "Unable to disable because the  element you are trying to disable is not sortable"
      );
    }
  };
}
