const express = require('express');
const app = express();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/movies', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'movies.html'));
});

app.post('/signupsubmit', (req, res) => {
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const email = req.body.email;
  const password = req.body.password;

  db.collection('users').add({
    Name: firstName + ' ' + lastName,
    email: email,
    password: password
  })
  .then(() => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
  })
  .catch(err => {
    console.error('Error adding user:', err);
    res.status(500).send('Error during signup.');
  });
});

app.post('/signinsubmit', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.collection('users').where('email', '==', email).get()
    .then(snapshot => {
      if (snapshot.empty) {
        return res.send('No matching documents.');
      }
      const matchingDoc = snapshot.docs.find(doc => doc.data().password === password);
      if (matchingDoc) {
        return res.redirect('/movies');
      } else {
        return res.send('Incorrect password.');
      }
    })
    .catch(err => {
      console.error('Error getting documents', err);
      return res.status(500).send('Error getting documents');
    });
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
