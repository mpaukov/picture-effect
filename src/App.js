import { useEffect, useState } from "react";
import "./App.css";
import { Canvas } from "./components";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => {
      setIsLoading((prev) => !prev);
    }, 3000);

    return () => clearTimeout(id);
  }, []);

  return (
    <div className="App">
      <header className="App-header"></header>
      <Canvas imageUploaded={isLoading} />
    </div>
  );
}

export default App;
