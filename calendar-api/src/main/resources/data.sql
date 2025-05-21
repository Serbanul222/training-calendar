INSERT INTO roles(id, name) VALUES (1, 'ROLE_ADMIN');
INSERT INTO roles(id, name) VALUES (2, 'ROLE_USER');

INSERT INTO users(id, email, password) VALUES ('admin-id', 'admin@example.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7Ob/uJu3aJJ.Uj4vl4YGTDN8NRr.G');
INSERT INTO user_roles(id, user_id, role_id) VALUES ('link-1', 'admin-id', 1);