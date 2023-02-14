import React, { useEffect, useRef, useState } from "react";

let savedStates = [];

function updatePicture(type, payload, lectureNoteId) {
  const msg = { type, payload, lectureNoteId };
  return JSON.stringify(msg);
}

const LectureQuestion = ({
  lectureNoteId,
  check,
  img,
  pdfimg,
  setCheck,
  socket,
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("black");
  const [thickness, setThickness] = useState(5);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    if (check !== 1) {
      setCheck(1);
      const canvas = canvasRef.current;
      canvas.style.backgroundImage = `url(${img.src})`;
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      socket.send(updatePicture("first1", "", lectureNoteId));
    }
    socket.addEventListener("message", (msg) => {
      const message = JSON.parse(msg.data);
      if (
        message.lectureNoteId === lectureNoteId &&
        message.type === "picture1"
      ) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        const Data2JSON = message.payload;
        const Data2Array = JSON.parse(Data2JSON);
        const Data2 = new ImageData(
          new Uint8ClampedArray(Data2Array),
          canvas.width,
          canvas.height
        );
        context.putImageData(Data2, 0, 0);
        pdfimg.Question = canvas.toDataURL();
      }
    });
  }, []);

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    savedStates.push(context.getImageData(0, 0, canvas.width, canvas.height));
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    setLastX(event.clientX - rect.left);
    setLastY(event.clientY - rect.top);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    const Data1 = context.getImageData(0, 0, canvas.width, canvas.height);
    const Data1Array = Array.from(Data1.data);
    const Data1JSON = JSON.stringify(Data1Array);
    socket.send(updatePicture("picture1", Data1JSON, lectureNoteId));
  };

  const drawing = (event) => {
    if (!isDrawing) {
      return;
    }
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.lineWidth = thickness;
    context.lineCap = "round";
    context.strokeStyle = color;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(x, y);
    context.stroke();
    setLastX(x);
    setLastY(y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const Data1 = context.getImageData(0, 0, canvas.width, canvas.height);
    const Data1Array = Array.from(Data1.data);
    const Data1JSON = JSON.stringify(Data1Array);
    socket.send(updatePicture("picture1", Data1JSON, lectureNoteId));
  };

  const restore = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    if (savedStates.length > 0) {
      context.putImageData(savedStates.pop(), 0, 0);
    }
    const Data1 = context.getImageData(0, 0, canvas.width, canvas.height);
    const Data1Array = Array.from(Data1.data);
    const Data1JSON = JSON.stringify(Data1Array);
    socket.send(updatePicture("picture1", Data1JSON, lectureNoteId));
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={img.width}
        height={img.height - 800}
        onMouseDown={startDrawing}
        onMouseMove={drawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div>
        <label htmlFor="color">Color:</label>
        <select
          id="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        >
          <option value="black">Black</option>
          <option value="red">Red</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
        </select>
        <label htmlFor="thickness">Thickness:</label>
        <input
          type="number"
          id="thickness"
          value={thickness}
          onChange={(event) => setThickness(event.target.value)}
        />
        <button onClick={clear}>Clear</button>
        <button onClick={restore}>Restore</button>
      </div>
    </div>
  );
};

export default LectureQuestion;