import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { myImage } from "./image";

class Particle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.x = Math.random() * this.width;
    this.y = Math.random() * this.height;
    this.speed = Math.random() * 0.5;
    this.velocity = Math.random() * 0.5;
    this.size = Math.random() * 1 + 1.5;
    this.position1 = Math.floor(this.y);
    this.position2 = Math.floor(this.x);
    this.recalculated = false;
  }

  update(mappedImage) {
    if (!this.recalculated && mappedImage.length > 0) {
      this.y = 0;
      this.recalculated = true;
      this.speed = mappedImage[this.position1][this.position2][0];
      this.size = Math.random() * 2;
    }
    if (this.y >= this.height) {
      this.y = 0;
      this.x = Math.random() * this.width;
    }
    this.position1 = Math.floor(this.y);
    this.position2 = Math.floor(this.x);
    if (this.position1 < 0) {
      this.position1 = 0;
    }
    let movement = 2.5 - this.speed + this.velocity * 9;
    this.y += movement;
  }
  draw(context, colors) {
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.save();

    if (colors.length > 0) {
      context.fillStyle = colors[this.position1][this.position2][0];
      context.globalAlpha = this.speed;
    } else {
      context.fillStyle = "rgb(255,255,255)";
      context.globalAlpha = this.speed * 0.9;
    }
    context.fill();
    context.restore();
  }
}

function calculateRelativeBrightness(red, green, blue) {
  return (
    Math.sqrt(red * red * 0.299 + green * green * 0.587 + blue * blue * 0.114) /
    100
  );
}

export const Canvas = ({ imageUploaded }) => {
  const requestIdRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [canvas2, setCanvas2] = useState(null);
  const [ctx2, setCtx2] = useState(null);
  const particlesArray = useMemo(() => [], []);
  const mappedImage = useMemo(() => [], []);
  const colors = useMemo(() => [], []);
  const numberOfParticles = 5000;

  useEffect(() => {
    setCanvas(canvasRef.current);
    setCanvas2(canvasRef2.current);
  }, []);

  const createParticles = useCallback((canvas, particlesArray) => {
    if (particlesArray.length === 0) {
      for (let i = 0; i < numberOfParticles; i++) {
        const width = canvas.width;
        const height = canvas.height;
        particlesArray.push(new Particle(width, height));
      }
    }
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.width = 440;
      canvas.height = 440;
      setCtx(canvas.getContext("2d"));
      createParticles(canvas, particlesArray);
    }
  }, [canvas, createParticles, particlesArray]);

  useEffect(() => {
    if (canvas2) {
      canvas2.width = 440;
      canvas2.height = 440;
      setCtx2(canvas2.getContext("2d"));
    }
  }, [canvas2]);

  useEffect(() => {
    if (canvas && ctx && particlesArray.length > 0) {
      animate();
    }
    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, ctx, particlesArray]);

  useEffect(() => {
    if (imageUploaded) {
      ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y++) {
        let row = [];
        let rowColor = [];
        for (let x = 0; x < canvas.width; x++) {
          const red = pixels.data[y * 4 * pixels.width + x * 4];
          const green = pixels.data[y * 4 * pixels.width + (x * 4 + 1)];
          const blue = pixels.data[y * 4 * pixels.width + (x * 4 + 2)];
          const color = `rgb(${red},${green},${blue})`;
          const brightness = calculateRelativeBrightness(red, green, blue);
          const cell = [brightness];
          const cellColor = [color];
          rowColor.push(cellColor);
          row.push(cell);
        }
        mappedImage.push(row);
        colors.push(rowColor);
      }
      setTimeout(() => {
        canvasRef2.current.className += " active";
        ctx2.drawImage(myImage, 0, 0, canvas2.width, canvas2.height);
        setTimeout(() => {
          cancelAnimationFrame(requestIdRef.current);
        }, 3000);
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUploaded]);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach((particle) => {
      particle.draw(ctx, colors);
      particle.update(mappedImage);
    });
    requestIdRef.current = window.requestAnimationFrame(animate);
  }

  return (
    <div>
      <canvas ref={canvasRef} className={"canvas"}></canvas>
      <canvas ref={canvasRef2} className={"canvas1"}></canvas>
    </div>
  );
};
