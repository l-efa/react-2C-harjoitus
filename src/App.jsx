import { useState, useEffect } from "react";
import axios from "axios";
import noteService from "./services/notes";

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    noteService.getAll().then((response) => {
      setNotes(response);
    });
  }, []);

  console.log("render", notes.length, "notes");

  const notesToShow = showAll
    ? notes
    : notes.filter((note) => note.important === true);

  const toggleImportanceOf = (id) => {
    const url = `http://localhost:3001/notes/${id}`;
    const note = notes.find((n) => n.id === id);
    console.log(note);
    const changedNote = { ...note, important: !note.important };

    noteService
      .update(id, changedNote)
      .then((response) => {
        console.log(response);
        setNotes(notes.map((note) => (note.id !== id ? note : response)));
      })
      .catch((error) => {
        setErrorMessage(
          `the note '${note.content}' was already deleted from server`
        );
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
        setNotes(notes.filter((n) => n.id !== id));
      });
  };

  const addNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() > 0.5,
    };

    noteService.create(noteObject).then((response) => {
      setNotes(notes.concat(response));
      setNewNote("");
    });
  };

  return (
    <div>
      <h1>Notes</h1>
      <div>
        <Notification errorMessage={errorMessage} />
      </div>
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) => (
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        ))}
      </ul>
      <Form
        newNote={newNote}
        setNewNote={setNewNote}
        notes={notes}
        setNotes={setNotes}
      />
    </div>
  );
}

const Notification = ({ errorMessage }) => {
  if (errorMessage === null) {
    return null;
  }
  return (
    <div className="error">
      <p>{errorMessage}</p>
    </div>
  );
};

const Note = ({ note, toggleImportance }) => {
  const label = note.important ? "make not important" : "make important";

  return (
    <>
      <li className="note">
        {note.content}
        <button onClick={toggleImportance}>{label}</button>
      </li>
    </>
  );
};

const Form = ({ newNote, setNewNote, notes, setNotes }) => {
  const postNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() > 0.5,
    };

    axios
      .post("http://localhost:3001/api/notes", noteObject)
      .then((response) => {
        console.log(response);
        setNotes(notes.concat(response.data));
        setNewNote("");
      })
      .catch((error) => {
        console.error("Error posting note", error);
      });
  };

  return (
    <>
      <form onSubmit={postNote}>
        <input
          type="text"
          value={newNote}
          onChange={(e) => {
            setNewNote(e.target.value);
          }}
        />
        <button type="submit">add note</button>
      </form>
    </>
  );
};

export default App;
