const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require("pg");

const pool = new Pool({
  user: "labber",
  password: "labber",
  host: "localhost",
  database: "lightbnb",
});

// the following assumes that you named your connection variable `pool`

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {

  const dbQuery = `
  SELECT * 
  FROM users
  WHERE email = $1;
  `;
  const dbOptions = [email];
  return pool
  .query(dbQuery, dbOptions)
  .then((result) => {

    if (!Array.isArray(result.rows) || !result.rows.length) {
      console.log('email does not exist');
      return null;
    }

    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getUserWithEmail = getUserWithEmail;


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const dbQuery = `
  SELECT * 
  FROM users
  WHERE id = $1;
  `;
  const dbOptions = [id];
  return pool
  .query(dbQuery, dbOptions)
  .then((result) => {

    if (!Array.isArray(result.rows) || !result.rows.length) {
      console.log('id does not exist');
      return null;
    }

    // return resolved id
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {

  const dbQuery = `
  INSERT INTO users (name, email, password) 
  VALUES ($1, $2, $3)
  RETURNING *;
  `;
  const dbOptions = [user.name, user.email, user.password];

  return pool
  .query(dbQuery, dbOptions)
  .then((result) => {

    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.addUser = addUser;


/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const dbQuery = `
  SELECT res.*
  FROM reservations AS res
  JOIN properties AS prop ON res.property_id = prop.id
  JOIN property_reviews AS rev ON prop.id = rev.property_id
  WHERE res.guest_id = $1
  GROUP BY res.id, prop.id
  ORDER BY res.start_date
  LIMIT $2;
  `;
  const dbOptions = [guest_id, limit];
  return pool
  .query(dbQuery, dbOptions)
  .then((result) => {

    return result.row[0];
  })
  .catch((err) => {
    console.log(err);
  });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  // 1
  const dbOptions = [];
  // 2
  let dbQuery = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // filter by city
  if (options.city) {
    dbOptions.push(`%${options.city}%`);
    dbQuery += `WHERE city LIKE $${dbOptions.length} `;
  }

  // filter by owner id
  if (options.owner_id) {
    dbOptions.push(options.owner_id);

    if (dbOptions.length > 1) {
      dbQuery += `AND owner_id = $${dbOptions.length} `;
    } else {

      dbQuery += `WHERE owner_id = $${dbOptions.length} `;
    }
  }

  // filter by min price per night
  if (options.minimum_price_per_night) {
    dbOptions.push(options.minimum_price_per_night * 100);

    if (dbOptions.length > 1) {
      dbQuery += `AND cost_per_night >= $${dbOptions.length} `;
    } else{

      dbQuery += `WHERE cost_per_night >= $${dbOptions.length} `;
    }
  }

  // filter by max price per night
  if (options.maximum_price_per_night) {
    dbOptions.push(options.maximum_price_per_night * 100);

    if (dbOptions.length > 1) {
      dbQuery += `AND cost_per_night <= $${dbOptions.length} `;
    } else{

      dbQuery += `WHERE cost_per_night <= $${dbOptions.length} `;
    }
  }

  // filter by minimum rating
  if (options.minimum_rating) {
    dbOptions.push(options.minimum_rating);

    if (dbOptions.length > 1) {
      dbQuery += `AND rating >= $${dbOptions.length} `;
    } else{

      dbQuery += `WHERE rating >= $${dbOptions.length} `;
    }
  }

  // 4
  dbOptions.push(limit);
  dbQuery += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${dbOptions.length};
  `;

  // 5
  // console.log(dbQuery, dbOptions);

  // 6
  return pool.query(dbQuery, dbOptions).then((res) => res.rows);
}
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {

  const dbQuery = `
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) 
  VALUES ($1, $2, $3, $4 , $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;
  `;
  const dbOptions = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];

  return pool
  .query(dbQuery, dbOptions)
  .then((result) => {

    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.addProperty = addProperty;
