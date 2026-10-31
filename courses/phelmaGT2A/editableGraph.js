function firstFreeId(cy, prefix) {
    let i = 0;
    while (cy.getElementById(prefix + i).nonempty())
        i++;
    return prefix + i;
}

function popEditableGraph(container, style, startElements = [], allowLoops=true, layout={name: 'preset'}, weighted=false) {
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
    r.weighted = false;
    if (weighted) {
        r.weighted = true;
        r.style().selector('edge[w]').style({
            'label': 'data(w)', 'font-family': 'sans-serif', 'font-size': 18, 'text-margin-y': -10
        }).update();

        const input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'decimal';
        Object.assign(input.style, {
            position: 'absolute', display: 'none', width: '46px', zIndex: 10,
            textAlign: 'center', font: '13px sans-serif', padding: '1px 2px'
        });
        ['mousedown', 'mouseup', 'click', 'touchstart'].forEach(t =>
            input.addEventListener(t, ev => ev.stopPropagation()));
        container.appendChild(input);

        let editing = null;

        const close = (commit) => {
            if (!editing)
                return;
            const edge = editing;
            editing = null;
            input.style.display = 'none';
            const v = input.value.trim();
            if (commit && v !== '' && !isNaN(Number(v))) {
                edge.data('w', Number(v));
                r.emit('edited');
            }
        };

        openWeightEditor = (edge) => {
            close(true);
            editing = edge;
            const p = edge.renderedMidpoint();
            input.value = edge.data('w') ?? '';
            input.style.left = (p.x - 23) + 'px';
            input.style.top  = (p.y - 11) + 'px';
            input.style.display = 'block';
            input.focus();
            input.select();
        };

        input.addEventListener('keydown', ev => {
            ev.stopPropagation();
            if (ev.key == 'Enter')
                close(true);
            if (ev.key == 'Escape')
                close(false);
        });
        input.addEventListener('blur', () => close(true));

        r.on('tap', 'edge', evt => {
            if (!r.srcEdit) openWeightEditor(evt.target);
        });
        r.on('tap', evt => {
            if (evt.target === r || evt.target.isNode())
                close(true);
        });
        r.on('remove', evt => {
            if (evt.target === editing)
                close(false);
        });

    }

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
            const e = r.add({group: 'edges', data: { id: firstFreeId(r, 'e'), source: r.srcEdit.id(), target: node.id()}});
            console.log(e, weighted);
            if (weighted) {
                e.data('w', 1);
            }
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

    r.on('add remove', evt => {
        r.emit('edited');
    });

    

    return r;
}