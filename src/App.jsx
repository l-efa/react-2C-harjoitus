import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [notes, setNotes] = useState([]);

  const hook = () => {
    console.log("effect");
    axios.get("http://localhost:3001/notes").then((response) => {
      console.log("promise fullfilled");
      setNotes(response.data);
    });
  };

  useEffect(hook, []);

  console.log("render", notes.length, "notes");

  return (
    <div>
      <p>hello world!</p>
    </div>
  );
}

export default App;
