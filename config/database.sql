CREATE TABLE Users(
    userId SERIAL NOT NULL PRIMARY KEY,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    isCustomer BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE Meals(
    mealId SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
    description TEXT NOT NULL
    price INT NOT NULL,
    image VARCHAR,
    created_at TIMESTAMP,
    restaurantId INT NOT NULL
    CONSTRAINT meals_restaurantId_fkey
        FOREIGN KEY (restaurantId)
            REFERENCES restaurants(restaurantId)
                ON DELETE CASCADE
);

CREATE TABLE Restaurants(
    restaurantId SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    address VARCHAR NOT NULL,
    adminFirstname VARCHAR(255) NOT NULL,
    adminLastname VARCHAR(255) NOT NULL,
    adminNumber INT NOT NULL,
    adminImage VARCHAR,
    created_at TIMESTAMP
);

CREATE TABLE Orders(
    orderId SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,
    delivered BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP,
    userId NOT NULL REFERENCES users(userId),
    restaurantId NOT NULL REFERENCES restaurants(restaurantId) 
    -- No need for 'ON DELETE CASCADE' since users should be able to see their previus orders weather the associated meal has been deleted or not
);

CREATE TABLE Ratings(
    ratingId SERIAL NOT NULL PRIMARY KEY,
    rating INT NOT NULL, -- 0 - 5
    type VARCHAR(30) NOT NULL -- meal or restaurant
    content TEXT,
    userId INT NOT NULL REFERENCES users(userId),
    mealId INT REFERENCES meals(mealId), -- rating could be for a meal or a restaurant
    restaurantId INT REFERENCES restaurants(restaurantId),
    created_at TIMESTAMP
);
-- CREATE TABLE Carts(
--     cartId SERIAL NOT NULL PRIMARY KEY,
-- )