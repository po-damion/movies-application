/**
 * es6 modules and imports
 */
import sayHello from './hello';
import getMovies from './api.js';
sayHello('World');

/**
 * require style imports
 */
//const {getMovies} = require('./api.js');

let stars = 0;
let editing = false;
let currId;
let currGenre = [];

const genres = ["Drama", "Horror", "Action", "Western", "Thriller", "Adventure", "Documentary", "Animation", "Romantic Comedy", "Fiction", "War Film", "Film Noir", "Science Fiction", "Romance", "Musical", "Family", "Fantasy", "Disaster Film", "Biographical", "Melodrama", "Slasher", "Spy", "Art", "Mystery", "B Movie", "Gangster", "Black Comedy", "Chick Flick", "Crime", "Comedy Horror", "Mockumentary", "Crime Fiction", "Cult", "Heist", "Neo-Noir", "Anime", "Indie", "Blaxpoitation", "Parody", "Peplum", "Satire"];

const uncheckBoxes = () => {
    $('.genre-checkbox').each((index, element) => {
        element.checked = false;
    });
    currGenre = [];
};

const getIdFromStr = (str) => {
    let holder = "";
    let retval = "";
    for(let i = 0; i < str.length; i++) {
        if(holder === 'btn-edit-' || holder === 'btn-delete-') {
            retval += str[i];
        } else {
            holder += str[i];
        }
    }
    return retval;
};

const populateGenreCheckboxes = () => {
    let inputStr = "";
    genres.forEach((genre) => {
        inputStr += '<label class="col-sm-3">';
        inputStr += `<input id="genre-${genre.split(' ').join('-')}" class="genre-checkbox" type="checkbox" value="${genre}">${genre}`;
        inputStr += '</label>';
    });
    $('.checkbox').html(inputStr);
};

const fetchMovies = () => {
    $.ajax('/api/movies')
        .done((datas) => {
            console.log(datas);
            $('#movies-insert').html('');
            $('#movies-insert').removeClass('text-center').addClass('text-left');
            datas.forEach(data => {
                let moviesStr = "";
                moviesStr += `<div class="movie-badges col-md-6">`;
                moviesStr += `<div class="panel panel-primary">`;
                moviesStr += `<div class="panel-heading">`;
                moviesStr += `<h3 id="movie-title-${data.id}" class="panel-title">${data.title}</h3>`;
                moviesStr += `</div>`;
                moviesStr += `<div id="movie-ratings-${data.id}" class="panel-body">`;
                for(var i = 0; i < parseInt(data.rating); i++) {
                    moviesStr += `<span class="glyphicon glyphicon-star" aria-hidden="true"></span>`;
                }
                moviesStr += `<div id="movie-genres-${data.id}" class="movie-badge-genre">`;
                data.genre.forEach(elem => {
                    moviesStr += `<span class="label label-info">${genres[elem]}</span>`;
                });
                moviesStr += `</div>`;
                moviesStr += `<div class="text-right"><div class="btn-group" id="btn-group-${data.id}"><button id="btn-edit-${data.id}" class="btn-edit btn btn-sm btn-default">Edit</button><button id="btn-delete-${data.id}" class="btn-delete btn btn-sm btn-danger">Delete</button></div></div>`
                moviesStr += `</div>`;
                moviesStr += `</div>`;
                moviesStr += `</div>`;
                $('#movies-insert').append(moviesStr);
            });

            $('.btn-delete').click((e) => {
                console.log('deleting');
                let clickedId = $(e.target).attr('id');
                clickedId = parseInt(getIdFromStr(clickedId));

                $(`#btn-group-${clickedId}`).html(`<button class="btn btn-sm btn-default" disabled>Pending</button>`);

                const url = `/api/movies/${clickedId}`;
                const options = {
                    method: 'DELETE'
                };
                fetch(url, options)
                    .then(response => response.json())
                    .then(data => {
                        //Confirm Delete Succeeded
                        console.log(data);
                        fetchMovies();
                    })
                    .catch(error => {
                        console.log(error);
                    });
            });

            $('.btn-edit').click((e) => {
                console.log('editing');
                let clickedId = $(e.target).attr('id');
                clickedId = parseInt(getIdFromStr(clickedId));
                $('#movie-title-input').val($(`#movie-title-${clickedId}`).html());
                $(`#movie-genres-${clickedId}>span`).each((index, element) => {
                    currGenre.push(genres.indexOf($(element).html()));
                    $(`#genre-${$(element).html().split(' ').join('-')}`)[0].checked = true;
                });
                let nth = $(`#movie-ratings-${clickedId}>span`).length;

                $(`#rating-area>span:nth-child(${nth})`).css('color', 'yellow').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
                $(`#rating-area>span:nth-child(${nth})`).prevAll().css('color', 'yellow').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
                $(`#rating-area>span:nth-child(${nth})`).nextAll().css('color', 'black').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
                stars = nth;

                editing = true;
                currId = clickedId;
                $('#movies-form-submit-btn').html('Edit');
                $('#movies-form-submit-btn').removeClass('btn-primary').addClass('btn-success');

                $('#movieFormModal').modal("show");
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
    populateGenreCheckboxes();

    $('.genre-checkbox').click((e) => {
        if(!$(e.target)[0].checked) {
            currGenre.splice(currGenre.indexOf(genres.indexOf(e.target.value)), 1);
        } else {
            currGenre.push(genres.indexOf(e.target.value));
        }
    });
};

$('#movies-form-cancel-btn').click(() => {
    $('#movies-form-submit-btn').html('Submit');
    $('#movies-form-submit-btn').removeClass('btn-success').addClass('btn-primary');
    stars = 0;
    $('#movieFormModal').modal("hide");
    $('#movie-title-input').val('');
    $('.star').css('color', 'black').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
    editing = false;
    uncheckBoxes();
});

$('#movies-form-submit-btn').click(() => {
    if($('#movie-title-input').val() !== '') {
        if(!editing) {
            const movies = {title: $('#movie-title-input').val(), rating: stars, genre: currGenre};
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
                    fetchMovies();
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            $(`#btn-group-${currId}`).html(`<button class="btn btn-sm btn-default" disabled>Pending</button>`);

            const movies = {title: $('#movie-title-input').val(), rating: stars, genre: currGenre};
            console.log(movies);
            const url = `/api/movies/${currId}`;
            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movies),
            };
            fetch(url, options)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    fetchMovies();
                })
                .catch(error => {
                    console.log(error);
                });
            editing = false;
            currId = undefined;
            $('#movies-form-submit-btn').html('Submit');
            $('#movies-form-submit-btn').removeClass('btn-success').addClass('btn-primary');
        }
    }
    $('#movie-title-input').val('');
    $('.star').css('color', 'black').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
    stars = 0;

    $('#movieFormModal').modal("hide");
    uncheckBoxes();
});

$('.star').click((e) => {
    $(e.target).css('color', 'yellow').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
    $(e.target).prevAll().css('color', 'yellow').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
    $(e.target).nextAll().css('color', 'black').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
    stars = $('#rating-area>span').index($(e.target))+1;
});
