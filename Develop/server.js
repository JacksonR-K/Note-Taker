const express = require('express');
const path = require('path');
const fs = require('fs');
// Helper method for generating unique ids
const uuid = require('./helpers/uuid');
const notes = require('./db/db');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

/* HTML Routes */

//Get request to go to notes.html page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);



/* API Routes */

//GET request to get all notes
app.get('/api/notes', (req, res) => {
    console.info(`GET /api/notes`);
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } else {
        res.status(200).json(JSON.parse(data));
        }
    })
});

//GET request for specific note
app.get('/api/notes/:id', (req, res) => {
    if (req.params.id) {
        console.info(`${req.method} request received to get a single a note`);
        const noteId = req.params.id;
        for (let i = 0; i < notes.length; i++) {
          const currentNote = notes[i];
          if (currentNote.id === noteId) {
            res.json(currentNote);
            return;
          }
        }
        res.status(404).send('note not found');
      } else {
        res.status(400).send('note ID not provided');
      }
    });

//POST request to add a note
app.post('/api/notes', (req, res) => {
    // Log that a POST request was received
    console.info(`${req.method} request received to add a note`);

    // Destructuring assignment for the items in req.body
    const { title, text } = req.body;

    // If all the required properties are present
    if (title && text) {
    // Variable for the object we will save
    const newNote = {
        title,
        text,
        id: uuid(),
    };

    // Obtain existing notes
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } else {
          // Convert string into JSON object
          const parsedNotes = JSON.parse(data);
  
          // Add a new review
          parsedNotes.push(newNote);
  
          // Write updated reviews back to the file
          fs.writeFile(
            './db/db.json',
            JSON.stringify(parsedNotes, null, 4),
            (writeErr) =>
              writeErr
                ? console.error(writeErr)
                : console.info('Successfully updated notes!')
          );
        }
      });

    const response = {
        status: 'success',
        body: newNote,
    };

    res.status(201).json(response);

    } else {
    res.status(500).json('Error in posting note');
    }
});

//Delete request to remove notes
app.delete('/api/notes/:id', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.info(err);
        res.status(500).json('Error deleting note')
      } else {
        //Convert string into JSON object
        const parsedNotes = JSON.parse(data);

        //Search for note containing specified ID
        for (let i=0; i<parsedNotes.length; i++) {
          if (parsedNotes[i].id === req.params.id) {
            //Remove note with specified ID
            console.log(parsedNotes);
            parsedNotes.splice(i, 1);
            console.log(parsedNotes);
          } 
        }
        console.log(parsedNotes);
        // Write updated reviews back to the file
        fs.writeFile(
          './db/db.json',
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully deleted note')
        );
        res.status(200).json(JSON.parse(data));
      }});
  });


//Get request to go to index.html page
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
)

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);

