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




// overwriting the defaults such as index.html
app.get('/', (request, response) => { // look in public
  response.render('pages/index.ejs');// look for specifically index .ejs and serve that up
})

app.post('/searches', (request, response) => {
  console.log(request.body);
  // { search: [ '1984', 'title' ] }
  let thingTheyAreSearchingFor = request.body.search[0];
  let titleOrAuthor = request.body.search[1];

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if(titleOrAuthor === 'title'){
    url += `+intitle:${thingTheyAreSearchingFor}`;
  } else if(titleOrAuthor === 'author'){
    url += `+inauthor:${thingTheyAreSearchingFor}`;
  }

  superagent.get(url)
    .then(results => {
      let bookArray = results.body.items;
      let finalBookArray = bookArray.map(book => {
        return new Book(book.volumeInfo);
      })
      // send this array of book objects into searches.ejs and render it from there
      // response.status(200).send(finalBookArray);
    })
})

function Book(obj){
  const placeholderImage = 'http://i.imgur.com/J5LVHEL.jpg';

  this.title = obj.title;
}

// function Book(obj) {
//   this.title = obj.volumeInfo.hasOwnProperty('title') ? obj.volumeInfo.title : 'No Title Available';
//   this.author = obj.volumeInfo.hasOwnProperty('authors') ? obj.volumeInfo.authors[0] : 'No Author Available';
//   this.description = obj.volumeInfo.hasOwnProperty('description') ? obj.volumeInfo.description : 'No Description Available';
//   let regex = /^https/;
//   let thumbUrl = obj.volumeInfo.imageLinks.hasOwnProperty('thumbnail') ? obj.volumeInfo.imageLinks.thumbnail : 'https://images.pexels.com/photos/2340254/pexels-photo-2340254.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
//   if (!regex.test(thumbUrl)) {
//     let splitUrl = thumbUrl.split('');
//     splitUrl.splice(4,0,'s');
//     thumbUrl = splitUrl.join('');
//   }
//   this.image_url = thumbUrl;
// }
























app.listen(PORT,()=>{
  console.log(`listening on ${PORT}`)

});