'use strict'
require('dotenv').config();//starts env file
const ejs = require('ejs');// opens ejs library

const express = require('express');//allows access to express library
const app = express();// assigns app to express
const superagent = require('superagent'); // assigns superagent so you can use it
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);//creating a new client in the database and having it look into the env file to find what port we are listening to
const PORT = process.env.PORT || 3001;//assigns varible to port number in env file
const methodOverride = require('method-override');
app.set('view engine','ejs');// tells express to use ejs and to look for a veiws folder
app.use(methodOverride('_method'))//activating method overide because you cannot do a method overide from front end
app.use(express.urlencoded({extended: true}));// 'this is the way it likes' ejs requires this to set a static page
app.use(express.static('./public'));// telling it not to look for index but to look for public instead
app.get('/', renderHomePage);
app.post('/books', createBook);
// app.put('/books/:book_id', createBook);//searches/new is the door you create
app.get('/searches/new', (request,response)=>{
  response.render('./pages/searches/new.ejs');
})

// overwriting the defaults such as index.html
// need fake data in a database before this will work


function renderHomePage(request,response){
  // response.send('hello');
  let SQL = 'SELECT * FROM books;'
  client.query(SQL)//clinet postgres we are making a query into the clinet and the query is SQL
    .then(results =>{
      let books = results.rows;
      let bookNumber = books.length;
      console.log('I am book #', bookNumber);
      response.render('./index.ejs', {bookArray:books, bookNumber})
    }).catch(err => handleError(err, response));
}

function createBook(request,response){
  console.log(request.body);
  let {title, author, isbn, image_url, description} = request.body;
  console.log('I am line 42', request.body);
  let sql = 'INSERT INTO books(title,author,isbn,image_url,description) VALUES ($1,$2,$3,$4,$5) RETURNING id;';
  let safeValues = [title,author,isbn,image_url,description];
  client.query(sql,safeValues)
    .then(results => {
      // console.log({id: results.rows});
      response.render('./index.ejs');
    }).catch(err => handleError(err, response));
}



app.post('/searches', (request, response) => {//recives searches from front end
  console.log(request.body);
  // { search: [ '1984', 'title' ] }
  let thingTheyAreSearchingFor = request.body.search[0];// defining the first result
  let titleOrAuthor = request.body.search[1];// defining the next result

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';//assigning url to google apis

  if(titleOrAuthor === 'title'){ //this takes either the title or author to get what your information your looking for
    url += `+intitle:${thingTheyAreSearchingFor}`;
  } else if(titleOrAuthor === 'author'){
    url += `+inauthor:${thingTheyAreSearchingFor}`;
  }
  // console.log('i am request.body.search' ,request.body.search);
  superagent.get(url)
    .then(results => {
      let bookArray = results.body.items;
      let finalBookArray = bookArray.map(book => {
        return new Book(book);
      })
      // send this array of book objects into searches.ejs and render it from there
      console.log(results.body.items[0]);
      console.log(finalBookArray);
      response.render('./pages/searches/show.ejs', {books:finalBookArray} )
    })
    .catch(error =>{ //catches errors

      Error(error, response);
    });
})

function Book(obj) {
  this.title = obj.volumeInfo.hasOwnProperty('title') ? obj.volumeInfo.title : 'No Title Available';
  this.author = obj.volumeInfo.hasOwnProperty('authors') ? obj.volumeInfo.authors[0] : 'No Author Available';
  this.description = obj.volumeInfo.hasOwnProperty('description') ? obj.volumeInfo.description : 'No Description Available';
  let regex = /^https/;
  let thumbUrl = obj.volumeInfo.imageLinks.hasOwnProperty('thumbnail') ? obj.volumeInfo.imageLinks.thumbnail : 'https://images.pexels.com/photos/2340254/pexels-photo-2340254.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
  if (!regex.test(thumbUrl)) {
    let splitUrl = thumbUrl.split('');
    splitUrl.splice(4,0,'s');
    thumbUrl = splitUrl.join('');
  }
  this.image_url = thumbUrl;
}























function handleError(error, response){
  console.error(error);
  response.status(500).send('ya done f**kd up joe.');
}

client.connect()
  .then(() => {
    app.listen(PORT,()=>{
      console.log(`listening on ${PORT}`)

    });
  })






