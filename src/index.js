/**
 * es6 modules and imports
 */
import sayHello from './hello';
import getMovies from './api.js';
import $ from 'jquery';
sayHello('World');

/**
 * require style imports
 */
//const {getMovies} = require('./api.js');

let stars = 0;

const fetchMovies = () => {
    $.ajax('/api/movies')
        .done((datas) => {
            $('#movies-insert').html('');
            $('#movies-insert').removeClass('text-center').addClass('text-left');
            datas.forEach(data => {
                // <div class="panel panel-default">
                //     <div class="panel-heading">
                //          <h3 class="panel-title">Panel title</h3>
                //     </div>
                //     <div class="panel-body">
                //         Panel content
                //     </div>
                //     </div>
                let moviesStr = "";
                moviesStr += `<div class="panel panel-primary">`;
                moviesStr += `<div class="panel-heading">`;
                moviesStr += `<h3 class="panel-title">${data.title}</h3>`;
                moviesStr += `</div>`;
                moviesStr += `<div class="panel-body">`;
                for(var i = 0; i < parseInt(data.rating); i++) {
                    moviesStr += `<span class="glyphicon glyphicon-star" aria-hidden="true"></span>`;
                }
                moviesStr += `<div class="text-right"><div class="btn-group"><button id="btn-edit-${data.id}" class="btn btn-sm btn-default">Edit</button><button id="btn-delete-${data.id}" class="btn btn-sm btn-danger">Delete</button></div></div>`
                moviesStr += `</div>`;
                moviesStr += `</div>`;
                $('#movies-insert').append(moviesStr);
            });
        })
        .fail(error => {
            console.log(`Error fetching info from movies: ${error}`);
        });
};

getMovies().then((movies) => {
    console.log('Here are all the movies:');
    movies.forEach(({title, rating, id}) => {
        console.log(`id#${id} - ${title} - rating: ${rating}`);
    });
}).catch((error) => {
    alert('Oh no! Something went wrong.\nCheck the console for details.')
    console.log(error);
});

window.onload = () => {
    $('#movies-insert').html('Loading...');
    //console.log('loading...');
    fetchMovies();
};

$('#movies-form-submit-btn').click(() => {
    if($('#movie-title-input').val() !== '') {
        const movies = {title: $('#movie-title-input').val(), rating: stars};
        console.log(movies);
        const url = '/api/movies';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movies),
        };
        fetch(url, options)
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.log(error);
            });
    }
    fetchMovies();
});

$('.star').click((e) => {
    $(e.target).css('color', 'yellow').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
    $(e.target).prevAll().css('color', 'yellow').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
    $(e.target).nextAll().css('color', 'black').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
    stars = $('#rating-area>span').index($(e.target))+1;
});
