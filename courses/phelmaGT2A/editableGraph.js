function firstFreeId(cy, prefix) {
    let i = 0;
    while (cy.getElementById(prefix + i).nonempty())
        i++;
    return prefix + i;
}

function popEditableGraph(container, style, startElements = [], allowLoops=true, layout={name: 'preset'}) {
    for (const el of container.children) {
        el.addEventListener("mousedown", (ev) => {
            ev.stopPropagation();
        });
    }
    
    const r = cytoscape({
        container: container,
        elements: startElements,
        layout: layout,
        userZoomingEnabled: false,
        userPanningEnabled: false,
        style: style,
        fit: false
    });

    r.on('tap', evt => {
        if (evt.target !== r)
            return;
        if (r.srcEdit) {
            r.deselectNode();
            return;
        }
        r.add({ group: 'nodes', data: {id: firstFreeId(r, 'v')}, position: evt.position});
    })

    r.on('tap', 'node', evt => {
        const node = evt.target;
        if (!r.srcEdit) {
            r.srcEdit = node;
            node.addClass('source');
            r.emit('selected', r.srcEdit);
        }
        else {
            if (!allowLoops && r.srcEdit.id() == node.id())
                return;
            r.add({group: 'edges', data: { id: firstFreeId(r, 'e'), source: r.srcEdit.id(), target: node.id()}});
            r.deselectNode();
        }
    });

    r.on('cxttap', 'node, edge', evt => {
        if (r.srcEdit == evt.target) {
            r.deselectNode();
        }
        evt.target.remove()
    });

    r.deselectNode = () => {
        if (r.srcEdit) {
            r.srcEdit.removeClass('source');
            r.emit('unselected', r.srcEdit);
            r.srcEdit = null;
        }
    }

    

    return r;
}