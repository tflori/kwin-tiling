
function ContainerNode(type, rect) {
    try {
        this.type = type;
        this.rectangle = rect || {};
        this.children = [];
        this.parent = null;

    } catch(err) {
        print(err, "in ContainerNode");
    }
}

ContainerNode.prototype.recalculateSize = function() {

    var r = this.rectangle;

    if (this.type === 'horizontal') {
        var newWidth = r.width / this.children.length;

        this.children.forEach(function(child, index) {
            child.rectangle.x = r.x + index*newWidth;
            child.rectangle.y = r.y;
            child.rectangle.width = newWidth;
            child.rectangle.height = r.height;
            if (child.children) child.recalculateSize();

        });

    } else if (this.type === 'vertical') {
        var newHeight = r.height / this.children.length;

        this.children.forEach(function(child, index) {
            child.rectangle.x = r.x;
            child.rectangle.y = r.y + index*newHeight;
            child.rectangle.width = r.width;
            child.rectangle.height = newHeight;
            if (child.children) child.recalculateSize();
        });
    }

};

ContainerNode.prototype.addNode = function(node, index) {
    this.children.splice(index, 0, node);
    node.parent = this;
    this.recalculateSize();
};

ContainerNode.prototype.removeNode = function(node) {
    this.children = this.children.filter(function (x) {return x !== node;});
    this.recalculateSize();
};

/*
 * Prunes empty containers and un-wraps single-child containers
 */
ContainerNode.prototype.cleanup = function(node) {
    // Size must be recalculated top-down, not bottom-up
    this.recalculateSize();

    // Defer node deletion so we don't delete during loop
    var nodesToRemove = [];

    for (var c = 0; c < this.children.size; ++c) {
        if (this.children[c].children) {
            if (this.children[c].children.length == 1) {
                var grandchild = this.children[c].children[0];
                this.children[c] = grandchild;
            } else if (this.children[c].children.length == 0) {
                nodesToRemove.push(this.children[c]);
            } else {
                this.children[c].cleanup();
            }
        }
    }
    nodesToRemove.forEach(function(nodeToRemove) {
        this.removeNode(nodeToRemove);
    });
};

ContainerNode.prototype.findParentContainer = function(leafNode) {
    var found = null;

    for (var c = 0; c < this.children.length; c++) {
        var child = this.children[c];

        if (child.children ) {
            var foundInChild = child.findParentContainer(leafNode);
            if (foundInChild) return foundInChild;
        } else if (child === leafNode) {
            return this;
        }

    }
    return null;
};

function LeafNode() {
    try {
        this.rectangle = {};
    } catch(err) {
        print(err, "in LeafNode");
    }
}
