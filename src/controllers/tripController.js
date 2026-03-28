const db = require('../db');
const { randomUUID } = require('crypto');
const mapToT = (val) => {
  if (!val) return 'PVT';
  const v = val.toString().toLowerCase();
  if (v === 'private' || v === 'pvt') return 'PVT';
  if (v === 'join' || v === 'sic' || v === 'sharing') return 'SIC';
  return 'PVT'; // Default safe value
};


exports.listTrips = async (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM trips';
  let params = [];

  if (status) {
    query += ' WHERE approved = $1';
    params.push(status === 'approved');
  }

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTrip = async (req, res) => {
  const { id } = req.params;
  try {
    const tripResult = await db.query('SELECT * FROM trips WHERE id::text = $1 OR uuid::text = $1', [id]);
    if (tripResult.rows.length === 0) return res.status(404).json({ message: 'Trip not found' });
    
    const trip = tripResult.rows[0];
    const hotelItems = await db.query('SELECT * FROM hotel_trip_items WHERE trip_item_id = $1', [trip.id]);
    const transferItems = await db.query('SELECT * FROM transfer_trip_items WHERE trip_item_id = $1', [trip.id]);
    const excursionItems = await db.query('SELECT * FROM excursion_trip_items WHERE trip_item_id = $1', [trip.id]);
    const tourItems = await db.query('SELECT * FROM tour_trip_items WHERE trip_item_id = $1', [trip.id]);
    const flightItems = await db.query('SELECT * FROM flight_trip_items WHERE trip_item_id = $1', [trip.id]);

    trip.hotels = hotelItems.rows;
    trip.transfers = transferItems.rows;
    trip.excursions = excursionItems.rows;
    trip.tours = tourItems.rows;
    trip.flights = flightItems.rows;

    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createTrip = async (req, res) => {
  const { 
    agent_id, client_name, client_phone, number_of_adults, number_of_kids, remarks,
    hotels, transfers, excursions, tours, flights, other, trip_start_date
  } = req.body;
  const uuid = randomUUID();

  try {
    await db.query('BEGIN');
    
    const approved = req.body.status === 'Approved';
    const declined = req.body.status === 'Declined';
    const tripResult = await db.query(
      'INSERT INTO trips (uuid, agent_id, client_name, client_phone, number_of_adults, number_of_kids, remarks, total_amount, final_amount, trip_start_date, approved, declined) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [uuid, agent_id || null, client_name || 'N/A', client_phone || '', number_of_adults || 0, number_of_kids || 0, remarks || '', req.body.total_amount || 0, req.body.final_amount || 0, trip_start_date || null, approved, declined]
    );
    const trip = tripResult.rows[0];

    // 1. Hotels
    if (hotels && hotels.length > 0) {
      for (const item of hotels) {
        await db.query(
          'INSERT INTO hotel_trip_items (trip_item_id, hotel_id, from_date, to_date, city, hotel_name, nights, single_price, double_price, room_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [trip.id, item.hotel_id || null, item.checkIn || null, item.checkOut || null, item.city || '', item.hotel || '', item.nights || 0, item.singleRoom || 0, item.doubleRoom || 0, item.room_type || '']
        );
      }
    }

    // 2. Transfers
    if (transfers && transfers.length > 0) {
      for (const item of transfers) {
        await db.query(
          'INSERT INTO transfer_trip_items (trip_item_id, transfer_id, from_location, to_location, from_date, to_date, tot, price, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [trip.id, item.transfer_id || null, item.from || '', item.to || '', item.date || null, item.date || null, mapToT(item.tot), item.price || 0, item.remarks || '']
        );
      }
    }

    // 3. Excursions
    if (excursions && excursions.length > 0) {
      for (const item of excursions) {
        await db.query(
          'INSERT INTO excursion_trip_items (trip_item_id, excursion_id, city, toe, from_date, to_date, hotel, price, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [trip.id, item.excursion_id || null, item.city || '', item.toe || '', item.date || null, item.date || null, mapToT(item.toe), item.price || 0, item.remarks || '']
        );
      }
    }

    // 4. Tours
    if (tours && tours.length > 0) {
      for (const item of tours) {
        await db.query(
          'INSERT INTO tour_trip_items (trip_item_id, tour_id, tot, from_location, from_date, to_date, number_of_adults, price, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [trip.id, item.tour_id || null, mapToT(item.tot), item.city || '', item.date || null, item.date || null, number_of_adults || 0, item.price || 0, item.remarks || '']
        );
      }
    }

    // 5. Flights
    if (flights && flights.length > 0) {
      for (const item of flights) {
        await db.query(
          'INSERT INTO flight_trip_items (trip_item_id, from_date, to_date, flight_number, in_or_out, route, price, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [trip.id, item.date || null, item.date || null, item.number || '', item.inOut || '', item.route || '', item.cost || 0, item.remarks || '']
        );
      }
    }
    if (other && other.length > 0) {
      for (const item of other) {
        await db.query(
          'INSERT INTO other_trip_items (trip_item_id, from_date, to_date) VALUES ($1, $2, $3)',
          [trip.id, item.date || null, item.date || null]
        );
      }
    }

    await db.query('COMMIT');
    res.status(201).json(trip);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTrip = async (req, res) => {
  const { id } = req.params;
  const { 
    agent_id, client_name, client_phone, number_of_adults, number_of_kids, remarks,
    hotels, transfers, excursions, tours, flights, other, total_amount, final_amount, trip_start_date
  } = req.body;

  try {
    await db.query('BEGIN');
    
    const result = await db.query(
      'UPDATE trips SET agent_id=$1, client_name=$2, client_phone=$3, number_of_adults=$4, number_of_kids=$5, remarks=$6, total_amount=$7, final_amount=$8, trip_start_date=$9, updated_at=CURRENT_TIMESTAMP WHERE id::text=$10 OR uuid::text=$10 RETURNING *',
      [agent_id || null, client_name || 'N/A', client_phone || '', number_of_adults || 0, number_of_kids || 0, remarks || '', total_amount || 0, final_amount || 0, trip_start_date || null, id]
    );

    if (result.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Trip not found' });
    }
    const trip = result.rows[0];

    // Delete old items
    await db.query('DELETE FROM hotel_trip_items WHERE trip_item_id = $1', [trip.id]);
    await db.query('DELETE FROM transfer_trip_items WHERE trip_item_id = $1', [trip.id]);
    await db.query('DELETE FROM excursion_trip_items WHERE trip_item_id = $1', [trip.id]);
    await db.query('DELETE FROM tour_trip_items WHERE trip_item_id = $1', [trip.id]);
    await db.query('DELETE FROM flight_trip_items WHERE trip_item_id = $1', [trip.id]);
    await db.query('DELETE FROM other_trip_items WHERE trip_item_id = $1', [trip.id]);

    // Insert new items (reusing loops if possible, but for simplicity rewriting)
    if (hotels) {
      for (const item of hotels) {
        await db.query('INSERT INTO hotel_trip_items (trip_item_id, hotel_id, from_date, to_date, city, hotel_name, nights, single_price, double_price, room_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
          [trip.id, item.hotel_id || null, item.checkIn || null, item.checkOut || null, item.city || '', item.hotel || '', item.nights || 0, item.singleRoom || 0, item.doubleRoom || 0, item.room_type || '']);
      }
    }
    if (transfers) {
      for (const item of transfers) {
        await db.query('INSERT INTO transfer_trip_items (trip_item_id, transfer_id, from_location, to_location, from_date, to_date, tot, price, remarks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [trip.id, item.transfer_id || null, item.from || '', item.to || '', item.date || null, item.date || null, mapToT(item.tot), item.price || 0, item.remarks || '']);
      }
    }
    if (excursions) {
      for (const item of excursions) {
        await db.query('INSERT INTO excursion_trip_items (trip_item_id, excursion_id, city, toe, from_date, to_date, hotel, price, remarks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [trip.id, item.excursion_id || null, item.city || '', item.toe || '', item.date || null, item.date || null, mapToT(item.toe), item.price || 0, item.remarks || '']);
      }
    }
    if (tours) {
      for (const item of tours) {
        await db.query('INSERT INTO tour_trip_items (trip_item_id, tour_id, tot, from_location, from_date, to_date, number_of_adults, price, remarks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [trip.id, item.tour_id || null, mapToT(item.tot), item.city || '', item.date || null, item.date || null, number_of_adults || 0, item.price || 0, item.remarks || '']);
      }
    }
    if (flights) {
      for (const item of flights) {
        await db.query('INSERT INTO flight_trip_items (trip_item_id, from_date, to_date, flight_number, in_or_out, route, price, remarks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
          [trip.id, item.date || null, item.date || null, item.number || '', item.inOut || '', item.route || '', item.cost || 0, item.remarks || '']);
      }
    }
    if (other) {
       for (const item of other) {
         // simplified other handling as it lacks other_id in UI
         await db.query('INSERT INTO other_trip_items (trip_item_id, from_date, to_date) VALUES ($1,$2,$3)',
           [trip.id, item.date || null, item.date || null]);
       }
    }

    await db.query('COMMIT');
    res.json(trip);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTripStatus = async (req, res) => {
  const { status } = req.body; // e.g., 'Approved', 'InProgress', 'Declined'
  try {
    const approved = status === 'Approved';
    const declined = status === 'Declined';
    const result = await db.query(
      'UPDATE trips SET approved=$1, declined=$2, updated_at=CURRENT_TIMESTAMP WHERE id::text=$3 RETURNING *',
      [approved, declined, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Trip not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    await db.query('BEGIN');
    // Delete items first due to FK
    await db.query('DELETE FROM hotel_trip_items WHERE trip_item_id::text = $1', [req.params.id]);
    await db.query('DELETE FROM transfer_trip_items WHERE trip_item_id::text = $1', [req.params.id]);
    await db.query('DELETE FROM excursion_trip_items WHERE trip_item_id::text = $1', [req.params.id]);
    await db.query('DELETE FROM tour_trip_items WHERE trip_item_id::text = $1', [req.params.id]);
    await db.query('DELETE FROM flight_trip_items WHERE trip_item_id::text = $1', [req.params.id]);
    await db.query('DELETE FROM other_trip_items WHERE trip_item_id::text = $1', [req.params.id]);
    await db.query('DELETE FROM trips WHERE id::text = $1', [req.params.id]);
    await db.query('COMMIT');
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
