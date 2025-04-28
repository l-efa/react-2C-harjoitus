import { useState, useEffect } from "react";
import axios from "axios";
import noteService from "./services/notes";
import loginService from "./services/login";
import { use } from "react";

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    noteService.getAll().then((response) => {
      setNotes(response);
    });
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedNoteappUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      noteService.setToken(user.token);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log("logging in with", username, password);

    try {
      const user = await loginService.login({ username, password });

      console.log("user: ", user);

      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));

      noteService.setToken(user.token);
      setUser(user);
      setUsername("");
      setPassword("");
    } catch (exception) {
      setErrorMessage("wrong credentials");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <h1>Login</h1>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  );

  console.log(user);

  const noteForm = () => (
    <form onSubmit={addNote}>
      <input value={newNote} onChange={toggleImportanceOf} />
      <button type="submit">save</button>
    </form>
  );

  console.log("render", notes.length, "notes");

  const notesToShow = showAll
    ? notes
    : notes.filter((note) => note.important === true);

  const toggleImportanceOf = (id) => {
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
      {!user && loginForm()}
      {user && (
        <div>
          <p>{user.username} logged in</p>
          {noteForm()}
        </div>
      )}
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) => (
          <Note
            key={note._id}
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
        addNote={addNote}
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

const Form = ({ newNote, setNewNote, notes, setNotes, addNote }) => {
  const postNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() > 0.5,
    };

    noteService.create(noteObject).then((response) => {
      setNotes(notes.concat(response));
      setNewNote("");
    });

    /*axios
    .post("https://react-3a-harjoitus.onrender.co/api/notes", noteObject)
    .then((response) => {
      console.log(response);
      setNotes(notes.concat(response.data));
      setNewNote("");
    })
    .catch((error) => {
      console.error("Error posting note", error);
    });*/
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
