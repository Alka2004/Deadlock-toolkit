import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "bootstrap/dist/css/bootstrap.min.css";

const ItemType = {
  PROCESS: "process",
  RESOURCE: "resource",
};

const DragItem = ({ id, type, name }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: { id, name, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="p-2 border rounded text-center m-1 bg-light"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      {name}
    </div>
  );
};

const DropZone = ({ title, acceptedType, onDrop, allocatedItems }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: acceptedType,
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className="border p-3 m-2 rounded"
      style={{
        minHeight: "80px",
        backgroundColor: isOver ? "#f8d7da" : "#fff",
      }}
    >
      <strong>{title}</strong>
      <div className="mt-2">
        {allocatedItems.map((item, index) => (
          <div key={index} className="badge bg-secondary m-1 p-2">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const DragDropGraph = ({ onUpdate }) => {
  const [processes, setProcesses] = useState(["P1", "P2", "P3"]);
  const [resources, setResources] = useState(["R1", "R2", "R3"]);
  const [allocations, setAllocations] = useState([]);

  const handleDrop = (item) => {
    setAllocations((prev) => [...prev, item]);
    onUpdate([...allocations, item]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <h4 className="text-center">Drag & Drop Resource Allocation</h4>
        <div className="d-flex justify-content-between">
          <div>
            <h5>Processes</h5>
            {processes.map((p) => (
              <DragItem key={p} id={p} type={ItemType.PROCESS} name={p} />
            ))}
          </div>
          <div>
            <h5>Resources</h5>
            {resources.map((r) => (
              <DragItem key={r} id={r} type={ItemType.RESOURCE} name={r} />
            ))}
          </div>
          <DropZone
            title="Allocated Resources"
            acceptedType={[ItemType.PROCESS, ItemType.RESOURCE]}
            onDrop={handleDrop}
            allocatedItems={allocations}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default DragDropGraph;
