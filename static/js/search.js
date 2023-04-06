const search_API = "/api/v1/search";
let logged_in = false;

const search_page_top = `
<h2>Search</h2>
<table style="font-size: 1vw;padding-left: 10%;padding-right: 10%">
    <tr>
        <th class="search-table">Flight Number</th>
        <th class="search-table">Origin</th>
        <th class="search-table">Destination</th>
        <th class="search-table">Time of Departure</th>
        <th class="search-table">Time of Arrival</th>
        <th class="search-table">Available Seats</th>
    </tr>`;
let search_page_middle = ``
const search_page_bottom = `
</table>
<button type="button" id="submit" onclick="searchAgain()" style="background-color: #F9F904; color: #520075">Search Again</button>
<button type="button" id="submit" onclick="book()" style="background-color: #F9F904; color: #520075">Book</button>
`;

function searchAgain(){
    window.location.reload()
}
function search(){
    const search_form = document.getElementById("booking-form")
    const search_form_data = new FormData(search_form)
    const search_xhr = new XMLHttpRequest();
    search_xhr.open("POST", search_API)
    search_xhr.onload = function (event) {
        const airport_xhr = new XMLHttpRequest()
        airport_xhr.open("GET", "/api/v1/get/airports")
        airport_xhr.onload = function (airports_event) {
            loadSearchResults(event.target.response, airports_event.target.response)
        }
        airport_xhr.send()
    }
    search_xhr.send(search_form_data)
}
function loadSearchResults(search_data, airports_data){
    search_data = JSON.parse(search_data)
    airports_data = JSON.parse(airports_data)
    let content_box = document.getElementById("search-form-mid-content-box")
    search_data.forEach((flight) => {
        let origin_airport_name = "Unknown"
        let destination_airport_name = "Unknown"
        let flight_number = flight[0]
        let origin_airport_code = flight[1]
        let destination_airport_code = flight[2]
        let depart_time = flight[3]
        let arrival_time = flight[4]
        let open_seats = flight[5]

        airports_data.forEach((airport) =>{
            if (origin_airport_name !== "Unknown" && destination_airport_name !== "Unknown"){
                return null
            }
            if(airport[0] === origin_airport_code){
                origin_airport_name = airport[1]
            }
            if (airport[0] === destination_airport_code){
                destination_airport_name = airport[1]
            }
        });

        let html_flight_data =
            `
            <tr>
                <td>${flight_number}</td>
                <td>${origin_airport_name}</td>
                <td>${destination_airport_name}</td>
                <td>${depart_time}</td>
                <td>${arrival_time}</td>
                <td>${open_seats}</td>
            </tr>
        `
        search_page_middle = search_page_middle.concat(html_flight_data)
    });
    content_box.style.gridColumnStart = "1"
    content_box.style.gridColumnEnd = "-1"
    content_box.innerHTML = search_page_top + search_page_middle + search_page_bottom

}
function book(){
    if (getCookie("logged_in") === "false"){
        location.replace("/login")
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
