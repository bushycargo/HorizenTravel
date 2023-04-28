const data_api_path = "/api/v1/get/"

let left_content_box = document.getElementById("left-table")
let right_content_box = document.getElementById("right-table")
let mid_content_box = document.getElementById("middle-control")

// Different Views: Users, Bookings, Flights, Airports, Contact Forms

let control_panel_html =`
<b><u>Control Panel</u></b>
<table id="admin-control-panel">
    <tr>
        <th>View</th>
        <th>Toggle</th>
    </tr>
    <tr>
        <td>Users</td>
        <td><input name="ctrl_check_box" onclick="checkTickBox(this)" value="users" type="checkbox"></td>
    </tr>
    <tr>
        <td>Bookings</td>
        <td><input name="ctrl_check_box" onclick="checkTickBox(this)" value="bookings" type="checkbox"></td>
    </tr>
    <tr>
        <td>Flights</td>
        <td><input name="ctrl_check_box" onclick="checkTickBox(this)" value="flights" type="checkbox"></td>
    </tr>
    <tr>
        <td>Airports</td>
        <td><input name="ctrl_check_box" onclick="checkTickBox(this)" value="airports" type="checkbox"></td>
    </tr>
    <tr>
        <td>Contact Forms</td>
        <td><input name="ctrl_check_box" onclick="checkTickBox(this)" value="contact_forms" type="checkbox"></td>
    </tr>
</table>
`
left_content_box.innerHTML = control_panel_html;


function checkTickBox(checkbox){
    let arr_tick_boxs = document.getElementsByName("ctrl_check_box");
    let view = checkbox.value;
    arr_tick_boxs.forEach((tick_box) =>{
        if (tick_box !== checkbox){
            tick_box.checked = false
        }
    })
    let api_path = ""

    let admin_view_top = `
    <b><u>${view.toUpperCase()}</u></b>
    <table id="admin-view">
    `
    let admin_view_bottom =`
    </table>
    `
    let table_headers = []
    switch (view) {
        case "users":
            api_path = data_api_path + "users"
            table_headers = ["User ID", "First Name", "Last Name", "Username", "Email"]
            break

        case "bookings":
            api_path = data_api_path + "bookings"
            table_headers = ["Booking ID", "User ID", "Flight Number", "Passengers"]
            break

        case "flights":
            api_path = data_api_path + "flights"
            table_headers = ["Flight Number", "Origin", "Destination", "Departure", "Arrival", "Free Seats"]
            break

        case "airports":
            api_path = data_api_path + "airports"
            table_headers = ["Airport Code", "Airport Name"]
            break

        case "contact_forms":
            api_path = data_api_path + "contact"
            table_headers = ["First Name", "Last Name", "Email", "Message", "Form ID"]
            break
    }
    const data_xhr = new XMLHttpRequest();
    data_xhr.open("GET", api_path)
    data_xhr.onload = function (event){
        generateTable(event.target.response)
    }
    data_xhr.send()
    function generateTable(admin_data){
        admin_data = JSON.parse(admin_data)

        let admin_table_header = "<tr>"
        table_headers.forEach((header_name) =>{
            admin_table_header = admin_table_header.concat(`<th style="padding-right: 10px">${header_name}</th>`)
        })
        admin_table_header = admin_table_header.concat("</tr>")

        let table_data = ""
        admin_data.forEach((data) =>{
            let data_row = "<tr>"
            for (let i = 0; i < table_headers.length; i++) {
                data_row = data_row.concat(`<td style="padding-right: 10px">${data[i]}</td>`)
            }
            data_row = data_row.concat("</tr>")
            table_data = table_data.concat(data_row)
        })
        mid_content_box.innerHTML = admin_view_top + admin_table_header + table_data + admin_view_bottom
    }
}
