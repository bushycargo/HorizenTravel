const search_API = "/api/v1/search";
let logged_in = false;



function searchAgain(){
    window.location.reload()
}
function search(){
    const search_page_top = `
    <h2>Search</h2>
    <form id="search-form">
        <table style="font-size: 1vw;padding-left: 10%;padding-right: 10%">
            <tr>
                <th class="search-table">Flight Number</th>
                <th class="search-table">Origin</th>
                <th class="search-table">Destination</th>
                <th class="search-table">Time of Departure</th>
                <th class="search-table">Time of Arrival</th>
                <th class="search-table">Available Seats</th>
                <th class="search-table">Book</th>
            </tr>`;

    let search_page_middle = ``
    const search_page_bottom = `
        </table>
        <button type="button" id="submit" onclick="searchAgain()" style="background-color: #F9F904; color: #520075">Search Again</button>
        <button type="button" id="submit" onclick="book()" style="background-color: #F9F904; color: #520075">Book</button>
    </form>`;
    const search_form = document.getElementById("booking-form")
    const search_form_data = new FormData(search_form)
    const search_xhr = new XMLHttpRequest();
    let adults = parseInt(search_form_data.get("total_adults"))
    let children = parseInt(search_form_data.get("total_children"))
    let passengers
    if(isNaN(children)){
        passengers = adults
    }else {
        passengers = adults + children
    }
    setCookie("passengers", passengers, 1)
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
                    <td><input type="checkbox" class="search-checkbox" onclick="checkTickBox(this)" name="flight" value="${flight_number}"></td>
                </tr>
            `
        search_page_middle = search_page_middle.concat(html_flight_data)
    });
    content_box.style.gridColumnStart = "1"
    content_box.style.gridColumnEnd = "-1"
    content_box.innerHTML = search_page_top + search_page_middle + search_page_bottom
}

}

function checkTickBox(checkbox){
    let arr_tick_boxs = document.getElementsByName("flight")
    arr_tick_boxs.forEach((tick_box) =>{
        if (tick_box !== checkbox){
            tick_box.checked = false
        }
    })
}

function book(){
    if (getCookie("logged_in") === "false"){
        location.replace("/login")
    }

    const people = parseInt(getCookie("passengers"))
    let html_box = document.getElementById("search-form-mid-content-box")
    const check_boxes = document.getElementsByName("flight")

    check_boxes.forEach((box) =>{
        if (box.checked === true){
            sendBookRequest(box.value)
        }
    })

    function sendBookRequest(flight_id){
        const book_xhr = new XMLHttpRequest()
        book_xhr.open("POST", "/api/v1/book/new")
        book_xhr.onload = function (event){
            displayBookMenu(parseInt(event.target.response))
        }
        book_xhr.setRequestHeader("Content-Type", "application/json")
        const request = {
            "flight_number":flight_id,
            "passengers":people
        }
        book_xhr.send(JSON.stringify(request))
    }

    function displayBookMenu(price){
        if(price === NaN){
            html_box.innerHTML = `
            <h2>Something went wrong!</h2>
            <hr>
            <p><a href="/book">Click here to try again</a></p>
            `
        }
        html_box.innerHTML = `
        <h2>Booking Sent!</h2>
        <hr>
        <p><b>Your booking is being processed now!</b></p>
        <hr>
        <p>Please use one of the buttons below to pay: £${price}<br>
        Once this has been confirmed you will recieve an email with your boarding information.<br>
        You can also see more details of your flight on your account page or if you <a href="/account">CLICK HERE</a>
        </p>
        `
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

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
