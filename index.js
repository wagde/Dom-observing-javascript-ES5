var urCapture = {
    isObserverActive: false,
    watchForAddedElementsArgs: [],
    watchForRemovedElementsSelectors: "selectors",
    initObserver: function () {
        this.isObserverActive = true;
        var callbackObserver = function (mutationsList) {
            mutationsList.forEach(function (list) {
                var removedNodes = list["removedNodes"][0];
                var addedNodes = list["addedNodes"][0];
                removedNodes && this.checkRemovedNodes(removedNodes);
                addedNodes && this.watchForAddedElementsArgs.length && this.checkAddedNodes(addedNodes);
            }.bind(this))
        }
        new MutationObserver(callbackObserver.bind(this)).observe(document, { childList: true, subtree: true });
    },

    watchForAddedElements: function (selectors, callback) {
        if (typeof selectors === "string" && typeof callback === "function") {
            this.watchForAddedElementsArgs.push({ "selectors": selectors, "callback": callback })
            if (!this.isObserverActive) this.initObserver();
        }
    },
    watchForRemovedElements: function (selectors, callback) {
        if (typeof selectors === "string" && typeof callback === "function") {
            this.watchForRemovedElementsSelectors += "," + selectors;
            if (!this.isObserverActive) this.initObserver();
            //node list
            var allElements = document.querySelectorAll(selectors);
            Array.prototype.slice.call(allElements).forEach(function (ele) {
                ele["watchForRemovedElements"] = callback;
            })
        }
    }
    ,
    checkRemovedNodes: function (removedNodes) {
        if (removedNodes.nodeType === 1) {
            var watchForRemovedElementsArgsSelectors = this['watchForRemovedElementsSelectors'];
            var elemnts = removedNodes.querySelectorAll(watchForRemovedElementsArgsSelectors);
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

    },

    checkAddedNodes: function (addedNodes) {
        if (addedNodes.nodeType === 1) {
            this.watchForAddedElementsArgs.forEach(function (args) {
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
}