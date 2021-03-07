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
    category VARCHAR NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    restaurantId INT NOT NULL,
    average_rating INT NOT NULL DEFAULT 0,
    rating_count INT NOT NULL DEFAULT 0,
    order_count INT NOT NULL DEFAULT 0,
    CONSTRAINT meals_restaurantId_fkey
        FOREIGN KEY (restaurantId)
            REFERENCES restaurants(restaurantId)
                ON DELETE CASCADE
);

CREATE TABLE Restaurants(
    restaurantId SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    address VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    image VARCHAR DEFAULT NULL,
    admin_user_id INT NOT NULL, -- when creating an admin user, tell them their contact details will be displayed for customers when the customers want to reach out to the restaurant.
    createdAt TIMESTAMP DEFAULT NOW(),
    average_rating INT NOT NULL DEFAULT 0,
    rating_count INT NOT NULL DEFAULT 0,
    FOREIGN KEY (admin_user_id) 
        REFERENCES Users(userId)
            ON DELETE CASCADE
);

CREATE TABLE Orders(
    orderId SERIAL NOT NULL PRIMARY KEY,
    mealId INT NOT NULL,
    status VARCHAR DEFAULT 'PENDING' NOT NULL, -- Order statuses: 'PENDING', 'PROCESSING', 'DELIVERED', 'REJECTED'. Consider adding a details column to show users when their order, for example, has been rejected.
    createdAt TIMESTAMP DEFAULT NOW(),
    restaurantid INT NOT NULL REFERENCES restaurants(restaurantid),
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