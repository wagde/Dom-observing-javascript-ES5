function UrCapture() {
    var watchForAddedElementsArgs = [];
    var watchForRemovedElementsSelectors = [];
    var isObserverActive = false;
    function initObserver() {
        isObserverActive = true;
        var callbackObserver = function (mutationsList) {
            mutationsList.forEach(function (list) {
                var removedNodes = list["removedNodes"][0];
                var addedNodes = list["addedNodes"][0];
                if (removedNodes && watchForRemovedElementsSelectors.length && removedNodes.nodeType === 1) {
                    checkRemovedNodes(removedNodes);
                }
                if (addedNodes && watchForAddedElementsArgs.length && addedNodes.nodeType === 1) {
                    checkAddedNodes(addedNodes);
                }

            })
        }
        new MutationObserver(callbackObserver).observe(document, { childList: true, subtree: true });
    }





    function checkRemovedNodes(removedNodes) {



        var elemnts = removedNodes.querySelectorAll(watchForRemovedElementsSelectors.join(","));
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



    function checkAddedNodes(addedNodes) {
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


    this.watchForAddedElements = function (selectors, callback) {
        if (typeof selectors === "string" && typeof callback === "function") {
            watchForAddedElementsArgs.push({ "selectors": selectors, "callback": callback })
            if (!isObserverActive) initObserver();
        }
    }

    this.watchForRemovedElements = function (selectors, callback) {
        if (typeof selectors === "string" && typeof callback === "function") {
            watchForRemovedElementsSelectors.push(selectors);
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