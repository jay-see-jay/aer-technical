CREATE TABLE company (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    active INTEGER NOT NULL CHECK(active IN (0, 1)),
    website TEXT NOT NULL,
    telephone TEXT NOT NULL,
    slogan TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL
);

CREATE TABLE employee (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL,
    company_id INTEGER,
    FOREIGN KEY (company_id) REFERENCES company(id)
);
