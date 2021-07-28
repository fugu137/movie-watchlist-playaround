import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import imdbLogo from "./images/imdb.png";
import tomatoLogo from "./images/tomatoes.png";
import metaLogo from "./images/metacritic.png";


const url = "http://www.omdbapi.com/?apikey=6f1357fb&type=movie";
const searchByTitle = "&s=";
const searchByID = "&i=";


class WatchlistRow extends React.Component {
    render() {
        return (
            <li id={this.props.id} draggable="true" onDragStart={drag} onDragOver={dragOver} onDrop={drop} onDragEnd={dragEnd}>
                <span className="movie-poster" draggable="false">
                    <img src={this.props.posterURL} alt={this.props.title + " poster"} />
                </span>
                <table className="movie-info" draggable="false">
                    <tbody>
                        <tr>
                            <td rowSpan={2}>
                                <h2 className="movie-title">{this.props.title + " (" + this.props.year + ")"}</h2>
                                <p className="movie-synopsis">{this.props.plot}</p>
                                <span className="runtime">{this.props.runtime}</span>
                                <span className={"advisory " + this.props.rated.charAt(0)}>{this.props.rated}</span>
                            </td>
                            <td className="rating">
                                <a href={"https://www.imdb.com/title/" + this.props.id} target="_blank" rel="noreferrer noopener" title="IMDb Rating">
                                    <img className="logo" src={imdbLogo} alt="imdb logo" />
                                    <h3>{this.props.imdbRating}</h3>
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td className="rating">
                                <a href={"https://www.rottentomatoes.com/m/" + this.props.title.replace(/\s+/g, "_").toLowerCase()} target="_blank" rel="noreferrer noopener" title="Rotten Tomatoes Rating">
                                    <img className="logo" src={tomatoLogo} alt="Rotten Tomatoes logo" />
                                    <h3>{this.props.tomatoRating}</h3>
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div>
                                    <p className="director"><em>Director: </em>{this.props.director}</p>
                                    <p className="actors"><em>Actors: </em>{this.props.actors}</p>
                                </div>
                                <div>
                                    {this.props.genres.map(genre =>
                                        <span key={genre} className="genre">{genre}</span>
                                    )}
                                </div>
                            </td>
                            <td className="rating">
                                <a href={"https://www.metacritic.com/movie/" + this.props.title.replace(/\s+/g, "-").toLowerCase()} target="_blank" rel="noreferrer noopener" title="Metacritic Rating">
                                    <img className="logo" src={metaLogo} alt="Metacritic logo" />
                                    <h3>{this.props.metaRating}</h3>
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </li>
        );
    }
}

class Watchlist extends React.Component {
    render() {
        const watchlist = this.props.watchlist;

        return (
            <ul className="watchlist">
                {watchlist.map(movie =>
                    <WatchlistRow
                        key={movie.imdbID}
                        id={movie.imdbID}
                        title={movie.Title}
                        year={movie.Year}
                        rated={movie.Rated}
                        runtime={movie.Runtime}
                        genres={movie.Genre.split(", ")}
                        director={movie.Director}
                        actors={movie.Actors}
                        plot={movie.Plot}
                        language={movie.Language}
                        imdbRating={movie.Ratings[0] !== undefined ? movie.Ratings[0].Value : "-"}
                        tomatoRating={movie.Ratings[1] !== undefined ? movie.Ratings[1].Value : "-"}
                        metaRating={movie.Ratings[2] !== undefined ? movie.Ratings[2].Value : "-"}
                        posterURL={movie.Poster}
                    />
                )}
                {watchlist.length > 0 ? <li id="placeholder" onDragOver={dragOver} onDrop={drop} onDragEnd={dragEnd}></li> : null}
            </ul>
        );
    }
}

class SearchResults extends React.Component {
    render() {
        const results = this.props.results;

        if (results === undefined) {
            return (
                <datalist ref={this.props.setRef} id="search-results" className="no-result">
                    <option>{"No movie titles match your search. Please try something else."}</option>
                </datalist>
            );
        }

        return (
            <datalist ref={this.props.setRef} id="search-results" className={results.length > 0 ? "visible" : "invisible"}>
                {results.map(result =>
                    <option key={result.imdbID} id={result.imdbID} onClick={this.props.selectionHandler}>
                        {result.Title + " (" + result.Year + ")"}
                    </option>
                )}
            </datalist>
        );
    }
}

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.search = this.search.bind(this);
    }

    search(e) {
        if (e.target.tagName !== "INPUT" || e.keyCode === 13) {
            console.log("Searching for: " + this.props.query);
            this.props.clickHandler();
        }
    }

    render() {
        return (
            <article className="search-bar">
                <span id="search-field">
                    <input type="search" placeholder="Search for a movie to add to your watchlist..." value={this.props.query} onChange={this.props.changeHandler} onKeyUp={this.search} />
                    <SearchResults setRef={this.props.setRef} results={this.props.results} selectionHandler={this.props.selectionHandler} />
                </span>
                <button onClick={this.search}>Search</button>
            </article>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: "",
            results: [],
            watchlist: []
        };
        this.resultsRef = React.createRef();

        this.updateQuery = this.updateQuery.bind(this);
        this.updateResults = this.updateResults.bind(this);
        this.addMovieToWatchlist = this.addMovieToWatchlist.bind(this);
        this.listenForClick = this.listenForClick.bind(this);
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.listenForClick);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.listenForClick);
    }

    listenForClick(e) {
        if (this.resultsRef && this.resultsRef.current && !this.resultsRef.current.contains(e.target) && e.target.nodeName !== "BUTTON") {
            this.setState({
                results: [],
                query: ""
            });
        }
    }

    updateQuery(e) {
        const value = e.target.value;
        this.setState({ query: value });
    }

    updateResults() {
        fetch(url + searchByTitle + this.state.query)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(response.message);
            })
            .then(data => {
                this.setState({ results: data.Search })
            })
            .catch(error =>
                console.error(error)
            );
    }

    addMovieToWatchlist(e) {
        this.setState({
            query: "",
            results: []
        });

        getMovieData(url, searchByID, e.target.id)
            .then(data => {
                this.setState(state => ({
                    watchlist: [...state.watchlist, data]
                }));
            });
    }

    render() {
        return (
            <section>
                <h1>Movie Watchlist</h1>
                <SearchBar query={this.state.query}
                    setRef={this.resultsRef}
                    results={this.state.results}
                    selectionHandler={this.addMovieToWatchlist}
                    changeHandler={this.updateQuery}
                    clickHandler={this.updateResults}
                />
                <Watchlist watchlist={this.state.watchlist} />
            </section>
        );
    }
}


ReactDOM.render(<App url={url} />, document.getElementById("react"));


async function getMovieData(url, searchType, query) {
    const response = await fetch(url + searchType + query)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.message);
        })
        .catch(error =>
            console.error(error)
        );
    return response;
}

// Drag and Drop //

const mouseCoordinates = {
    x: null,
    y: null,
    xold: null,
    yold: null,

    setCoordinates(x, y) {
        this.xold = this.x;
        this.yold = this.y;
        this.x = x;
        this.y = y;
    },

    mouseMovingUp() {
        return (this.y - this.yold < 0);
    },

    mouseMovingDown() {
        return (this.y - this.yold > 0);
    }
}

document.ondragover = (event) => {
    mouseCoordinates.setCoordinates(event.clientX, event.clientY);
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
    event.dataTransfer.dropEffect = "move";
}

function dragOver(event) {
    event.preventDefault();

    const dragItem = document.getElementById(event.dataTransfer.getData("text"));
    const targetItem = event.target;
    const placeholder = document.getElementById("placeholder");

    console.log(targetItem)

    if (targetItem === placeholder) {
        return;
    }

    if (targetItem === dragItem) {
        return;
    }

    if (targetItem.nodeName !== "LI") {
        return;
    }

    dragItem.classList.add("hide");

    if (mouseCoordinates.mouseMovingUp()) {
        targetItem.parentNode.insertBefore(placeholder, targetItem);

    } else if (mouseCoordinates.mouseMovingDown()) {
        if (targetItem.nextElementSibling !== null) {
            targetItem.parentNode.insertBefore(placeholder, targetItem.nextElementSibling);
        } else {
            targetItem.parentNode.appendChild(placeholder);
        }

    }

    placeholder.style.display = "block";
    placeholder.classList.add("grow");

}

function drop(event) {
    event.stopPropagation();
    event.preventDefault();

    const dragItem = document.getElementById(event.dataTransfer.getData("text"));
    const targetItem = event.target;
    const placeholder = document.getElementById("placeholder");

    if (targetItem === placeholder) {
        dragItem.parentNode.replaceChild(dragItem, targetItem)
        document.querySelector(".watchlist").appendChild(targetItem);
    }
}

function dragEnd(event) {
    event.preventDefault();

    const dragItem = document.getElementById(event.dataTransfer.getData("text"));
    const placeholder = document.getElementById("placeholder");

    placeholder.classList.remove("grow");
    placeholder.style.display = "none";
    dragItem.classList.remove("hide");
}

