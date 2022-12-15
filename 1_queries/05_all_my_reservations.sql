SELECT res.id AS id, prop.title AS title, prop.cost_per_night AS cost_per_night, res.start_date AS start_date, AVG(rev.rating) AS average_rating
FROM reservations AS res
JOIN properties AS prop ON res.property_id = prop.id
JOIN property_reviews AS rev ON prop.id = rev.property_id
WHERE res.guest_id = 1
GROUP BY res.id, prop.id
ORDER BY res.start_date
LIMIT 10;