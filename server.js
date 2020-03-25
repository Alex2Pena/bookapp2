'use strict'
require('dotenv').config();//starts env file
const ejs = require('ejs');// opens ejs library

const express = require('express');//allows access to express library
const app = express();// assigns app to express
const superagent = require('superagent'); // assigns superagent so you can use it 

const PORT = process.env.PORT || 3001;//assigns varible to port number in env file
app.set('view engine','ejs');// tells express to use ejs and to look for a veiws folder

app.use(express.urlencoded({extended: true}));// 'this is the way it likes' ejs requires this to set a static page
app.use(express.static('./public'));// telling it not to look for index but to look for public instead

//searche/new is the door you create
app.get('/searches/new', (request,response)=>{
  response.render('./pages/searches/new.ejs');
})

// overwriting the defaults such as index.html
app.get('/', (request, response) => { // look in public
  response.render('pages/index.ejs');// look for specifically index .ejs and serve that up
})


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
  console.log('i am request.body.search' ,request.body.search);
  superagent.get(url)
    .then(results => {
      let bookArray = results.body.items;
      let finalBookArray = bookArray.map(book => {
        return new Book(book);
      })
      // send this array of book objects into searches.ejs and render it from there
      
    response.render('./pages/searches/show.ejs', {books:finalBookArray} )
  })
  .catch(error =>{   //catches errors
    
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























function Error(error, response){
  console.error(error);
  return response.status(500).send('ya done f**kd up joe.');
}
app.listen(PORT,()=>{
  console.log(`listening on ${PORT}`)

});