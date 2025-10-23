import React, { useState } from "react";

const BookingCard = ({ bookings }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filter === "all" || b.status.toLowerCase() === filter;
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="booking-container">
      <div className="booking-controls">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="text"
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ul id="bookings-list">
        {filteredBookings.map((b) => (
          <li key={b.id} data-status={b.status}>
            {b.title} - {b.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingCard;
