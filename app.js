const { useState, useRef } = React;

function App() {
  const [nodes, setNodes] = useState([]);
  const idRef = useRef(0);
  const canvasRef = useRef(null);

  const addNode = () => {
    const newNode = {
      id: idRef.current++,
      x: 100,
      y: 100,
      text: 'New Note'
    };
    setNodes(n => [...n, newNode]);
  };

  const handleDrag = (id, dx, dy) => {
    setNodes(nodes => nodes.map(node => node.id === id ? { ...node, x: node.x + dx, y: node.y + dy } : node));
  };

  return (
    React.createElement('div', { className: 'canvas', ref: canvasRef },
      React.createElement('button', { className: 'add-button', onClick: addNode }, 'Add Note'),
      nodes.map(node => React.createElement(Node, { key: node.id, node, onDrag: handleDrag }))
    )
  );
}

function Node({ node, onDrag }) {
  const nodeRef = useRef(null);
  const posRef = useRef({ x: node.x, y: node.y });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    posRef.current = { x: node.x, y: node.y };
  }, [node.x, node.y]);

  const onMouseDown = e => {
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    e.stopPropagation();
  };

  const onMouseMove = e => {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = { x: e.clientX, y: e.clientY };
    posRef.current.x += dx;
    posRef.current.y += dy;
    onDrag(node.id, dx, dy);
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  React.useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return React.createElement('div', {
    ref: nodeRef,
    className: 'node',
    style: { left: node.x, top: node.y },
    onMouseDown
  }, node.text);
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
