import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function bookingForm() {
    const [destination, setDestination] = useState("");

    return (
        <form>
            <label>Enter Destination:
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                />
            </label>
        </form>
    )
}

const root = ReactDOM.createRoot(document.getElementById("bookingForm"));
root.render(bookingForm());