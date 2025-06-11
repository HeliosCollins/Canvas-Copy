const { useState, useRef } = React;

// Basic canvas inspired by Obsidian Canvas with pan, zoom and editable notes

function App() {
  const [nodes, setNodes] = useState([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const idRef = useRef(0);
  const canvasRef = useRef(null);
  const panning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const addNode = () => {
    const newNode = {
      id: idRef.current++,
      x: 100,
      y: 100,
      text: 'New Note'
    };
    setNodes(n => [...n, newNode]);
  };

  const updateNodeText = (id, text) => {
    setNodes(n => n.map(node => node.id === id ? { ...node, text } : node));
  };

  const onCanvasMouseDown = e => {
    if (e.target !== canvasRef.current) return;
    panning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
  };

  const onCanvasMouseMove = e => {
    if (!panning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    panStart.current = { x: e.clientX, y: e.clientY };
    setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
  };

  const onCanvasMouseUp = () => {
    panning.current = false;
  };

  const onWheel = e => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform(t => {
      let scale = t.scale * factor;
      scale = Math.min(Math.max(scale, 0.2), 2);
      const x = offsetX - ((offsetX - t.x) / t.scale) * scale;
      const y = offsetY - ((offsetY - t.y) / t.scale) * scale;
      return { x, y, scale };
    });
  };

  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('mousemove', onCanvasMouseMove);
    el.addEventListener('mouseup', onCanvasMouseUp);
    el.addEventListener('mouseleave', onCanvasMouseUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('mousemove', onCanvasMouseMove);
      el.removeEventListener('mouseup', onCanvasMouseUp);
      el.removeEventListener('mouseleave', onCanvasMouseUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const handleDrag = (id, dx, dy) => {
    setNodes(nodes => nodes.map(node => node.id === id ? { ...node, x: node.x + dx, y: node.y + dy } : node));
  };

  const canvasStyle = {
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`
  };

  return (
    React.createElement('div', {
        className: 'canvas',
        ref: canvasRef,
        onMouseDown: onCanvasMouseDown
      },
      React.createElement('div', { className: 'toolbar' },
        React.createElement('button', { className: 'add-button', onClick: addNode }, '\u2795')
      ),
      React.createElement('div', { className: 'canvas-inner', style: canvasStyle },
        nodes.map(node => React.createElement(Node, {
          key: node.id,
          node,
          onDrag: handleDrag,
          onUpdateText: updateNodeText,
          scale: transform.scale
        }))
      )
    )
  );
}

function Node({ node, onDrag, onUpdateText, scale }) {
  const nodeRef = useRef(null);
  const posRef = useRef({ x: node.x, y: node.y });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(node.text);

  React.useEffect(() => {
    posRef.current = { x: node.x, y: node.y };
  }, [node.x, node.y]);

  React.useEffect(() => {
    setText(node.text);
  }, [node.text]);

  const onMouseDown = e => {
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    e.stopPropagation();
  };

  const onMouseMove = e => {
    if (!dragging.current) return;
    const dx = (e.clientX - start.current.x) / scale;
    const dy = (e.clientY - start.current.y) / scale;
    start.current = { x: e.clientX, y: e.clientY };
    posRef.current.x += dx;
    posRef.current.y += dy;
    onDrag(node.id, dx, dy);
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  const onDoubleClick = e => {
    e.stopPropagation();
    setEditing(true);
  };

  const finishEdit = () => {
    setEditing(false);
    onUpdateText(node.id, text);
  };

  React.useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  if (editing) {
    return React.createElement('textarea', {
      className: 'node node-edit',
      style: { left: node.x, top: node.y },
      ref: nodeRef,
      value: text,
      onChange: e => setText(e.target.value),
      onBlur: finishEdit,
      autoFocus: true
    });
  }

  return React.createElement('div', {
    ref: nodeRef,
    className: 'node',
    style: { left: node.x, top: node.y },
    onMouseDown: onMouseDown,
    onDoubleClick: onDoubleClick
  }, text);
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));

