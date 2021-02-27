CREATE TABLE Users(
    userId SERIAL NOT NULL PRIMARY KEY,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone INT DEFAULT NULL,
    password VARCHAR NOT NULL,
    type VARCHAR(45) DEFAULT "CUSTOMER" NOT NULL, -- or "ADMIN"
    createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Meals(
    mealId SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL,
    image VARCHAR NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    restaurantId INT NOT NULL,
    rating NOT NULL DEFAULT 0, -- this is the average rating of the meal
    CONSTRAINT meals_restaurantId_fkey
        FOREIGN KEY (restaurantId)
            REFERENCES restaurants(restaurantId)
                ON DELETE CASCADE
);

CREATE TABLE Restaurants(
    restaurantId SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    address VARCHAR NOT NULL,
    userId INT NOT NULL, -- when creating an admin user, tell them their contact details will be displayed for customers when the customers want to reach out to the restaurant.
    createdAt TIMESTAMP DEFAULT NOW(),
    rating NOT NULL DEFAULT 0,
    FOREIGN KEY (userId) 
        REFERENCES Users(userId)
            ON DELETE CASCADE
);

CREATE TABLE Orders(
    orderId SERIAL NOT NULL PRIMARY KEY,
    mealId INT NOT NULL,
    status VARCHAR DEFAULT "PENDING" NOT NULL -- Order statuses: 'PENDING', 'PROCESSING', 'DELIVERED', 'REJECTED'. Consider adding a details column to show users when their order, for example, has been rejected.
    createdAt TIMESTAMP DEFAULT NOW(),
    userId NOT NULL REFERENCES users(userId),
    FOREIGN KEY (mealId)
        REFERENCES Meals(mealId)
            ON DELETE SET NULL
    -- No need for 'ON DELETE CASCADE' since users should be able to see their previous orders whether the associated meal has been deleted or not
);

CREATE TABLE MealRatings(
    ratingId SERIAL NOT NULL PRIMARY KEY,
    rating INT NOT NULL, -- ranges from 0 to 5
    review TEXT DEFAULT NULL,
    userId INT NOT NULL REFERENCES users(userId),
    mealId INT NOT NULL, -- rating could be for a meal or a restaurant
    createdAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (mealId)
        REFERENCES Meals(mealId)
            ON DELETE CASCADE
);

CREATE TABLE RestaurantRatings(
    ratingId SERIAL NOT NULL PRIMARY KEY,
    rating INT NOT NULL, -- ranges from 0 to 5
    review TEXT DEFAULT NULL,
    userId INT NOT NULL REFERENCES users(userId),
    restaurantId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW()
    FOREIGN KEY (restaurantId)
        REFERENCES Restaurants(restaurantId)
            ON DELETE CASCADE
);
-- CREATE TABLE Carts(
--     cartId SERIAL NOT NULL PRIMARY KEY,
-- )




CREATE TABLE Users(
    userId SERIAL NOT NULL PRIMARY KEY,
    type VARCHAR(45) DEFAULT 'CUSTOMER',
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone INT DEFAULT NULL,
    password VARCHAR NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Meals(
    mealId SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL,
    image VARCHAR NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    restaurantId INT NOT NULL,
    average_rating INT NOT NULL DEFAULT 0,
    rating_count INT NOT NULL DEFAULT 0,
    CONSTRAINT meals_restaurantId_fkey
        FOREIGN KEY (restaurantId)
            REFERENCES restaurants(restaurantId)
                ON DELETE CASCADE
);

CREATE TABLE Restaurants(
    restaurantId SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    address VARCHAR NOT NULL,
    userId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    rating INT NOT NULL DEFAULT 0,
    FOREIGN KEY (userId) 
        REFERENCES Users(userId)
            ON DELETE CASCADE
);

CREATE TABLE Orders(
    orderId SERIAL NOT NULL PRIMARY KEY,
    mealId INT NOT NULL,
    status VARCHAR DEFAULT 'PENDING' NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    userId INT NOT NULL REFERENCES users(userId),
    FOREIGN KEY (mealId)
        REFERENCES Meals(mealId)
            ON DELETE SET NULL
);

CREATE TABLE MealRatings(
    ratingId SERIAL NOT NULL PRIMARY KEY,
    rating INT NOT NULL,
    review TEXT DEFAULT NULL,
    userId INT NOT NULL REFERENCES users(userId),
    mealId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (mealId)
        REFERENCES Meals(mealId)
            ON DELETE CASCADE
);

CREATE TABLE RestaurantRatings(
    ratingId SERIAL NOT NULL PRIMARY KEY,
    rating INT NOT NULL,
    review TEXT DEFAULT NULL,
    userId INT NOT NULL REFERENCES users(userId),
    restaurantId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (restaurantId)
        REFERENCES Restaurants(restaurantId)
            ON DELETE CASCADE
);