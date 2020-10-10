function UrCapture() {
    var watchForAddedElementsArgs = [];
    var watchForRemovedElementsSelectors = "selectorsHereRemovedElements";
    var isObserverActive = false;
    function initObserver() {
        isObserverActive = true;
        var callbackObserver = function (mutationsList) {
            mutationsList.forEach(function (list) {
                var removedNodes = list["removedNodes"][0];
                var addedNodes = list["addedNodes"][0];
                removedNodes && checkRemovedNodes(removedNodes);
                addedNodes && watchForAddedElementsArgs.length && checkAddedNodes(addedNodes);
            })
        }
        new MutationObserver(callbackObserver).observe(document, { childList: true, subtree: true });
    }


  


    function checkRemovedNodes(removedNodes) {
        if (removedNodes.nodeType === 1) {
            var elemnts = removedNodes.querySelectorAll(watchForRemovedElementsSelectors);
            /// if the element it self has been deleted
            if (typeof removedNodes["watchForRemovedElements"] === "function") {
                removedNodes["watchForRemovedElements"]();
            }
            /// this check if one of the parent's elements has been deleted
            if (!!elemnts.length) {
                Array.prototype.slice.call(elemnts).forEach(function (ele) {
                    typeof ele["watchForRemovedElements"] === "function" && ele["watchForRemovedElements"]()
                })
            }
        }

    }

    function checkAddedNodes(addedNodes) {
        if (addedNodes.nodeType === 1) {
            watchForAddedElementsArgs.forEach(function (args) {
                var selectors = args['selectors'];
                var callback = args['callback'];
                var childNodes = addedNodes.querySelectorAll(selectors);
                var elemnts = Array.prototype.slice.call(document.querySelectorAll(selectors));
                var elemntIndex = elemnts.indexOf(addedNodes);
                /// if the element it self has been added
                if (elemntIndex > -1) {
                    addedNodes["callback"] = callback;
                    addedNodes["callback"]();
                }
                /// this check if one of the elemnt has been added in a  parent's elements;
                if (childNodes.length) {
                    Array.prototype.slice.call(childNodes).forEach(function (ele) {
                        ele["callback"] = callback;
                        ele["callback"]();
                    })
                }
            })
        }
    }


    this.watchForAddedElements = function (selectors, callback) {
        if (typeof selectors === "string" && typeof callback === "function") {
            watchForAddedElementsArgs.push({ "selectors": selectors, "callback": callback })
            if (!isObserverActive) initObserver();
        }
    }

    this.watchForRemovedElements = function (selectors, callback) {
        if (typeof selectors === "string" && typeof callback === "function") {
            watchForRemovedElementsSelectors += "," + selectors;
            if (!isObserverActive) initObserver();
            //node list
            var allElements = document.querySelectorAll(selectors);
            Array.prototype.slice.call(allElements).forEach(function (ele) {
                ele["watchForRemovedElements"] = callback;
            })
        }
    }

}


var urCapture = new UrCapture()