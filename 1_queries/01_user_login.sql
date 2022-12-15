SELECT users.id AS id, users.name AS name, users.email AS email, users.password AS password
FROM users
WHERE users.email LIKE ('tristanjacobs@gmail.com');