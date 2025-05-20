INSERT INTO roles(id, name) VALUES (1, 'ROLE_ADMIN');
INSERT INTO roles(id, name) VALUES (2, 'ROLE_USER');

INSERT INTO users(id, email, password) VALUES ('89cf2a6a-620f-483f-887a-349248f1c029', 'admin@example.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7Ob/uJu3aJJ.Uj4vl4YGTDN8NRr.G');
INSERT INTO user_roles(id, user_id, role_id) VALUES ('b57bf156-4045-4f97-90b7-3f8311a2b75d', '89cf2a6a-620f-483f-887a-349248f1c029', 1);
