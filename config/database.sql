CREATE TABLE Users(
    userId SERIAL NOT NULL PRIMARY KEY,
    type VARCHAR(45) DEFAULT 'CUSTOMER',
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR DEFAULT NULL,
    password VARCHAR NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Meals(
    mealId SERIAL NOT NULL PRIMARY KEY,
    mealname VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    mealimage VARCHAR NOT NULL,
    category INT REFERENCES Categories(categoryid) ON DELETE SET NULL,
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
    account_number VARCHAR NULL,
    account_bank VARCHAR NULL,
    account_name VARCHAR NULL,
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
    order_ref INT DEFAULT 'floor(random() * 1000000)' NOT NULL,
    delivery_address VARCHAR NOT NULL,
    delivery_city VARCHAR NOT NULL,
    delivery_type VARCHAR NOT NULL, -- 'DELIVERY' or 'PICKUP'
    cash_amount INT NOT NULL,
    mealId INT NOT NULL,
    status VARCHAR DEFAULT 'PENDING' NOT NULL, -- Order statuses: 'PENDING', 'PROCESSING', 'DELIVERED', 'REJECTED'. Consider adding a details column to show users when their order, for example, has been rejected.
    quantity INT DEFAULT 1 NOT NULL,
    order_note VARCHAR DEFAULT NULL,
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


CREATE TABLE Categories(
    categoryid SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL
)

CREATE TABLE Notifications(
    notification_id SERIAL NOT NULL PRIMARY KEY,
    notification_message VARCHAR NOT NULL,
    notification_read BOOLEAN DEFAULT 'false' NOT NULL,
    notification_user_id INT NOT NULL REFERENCES Users(userid),
    notification_order_id INT NOT NULL REFERENCES Orders(orderid),
    notification_created_at TIMESTAMP DEFAULT NOW()
)

-- Simply tasty; African delicious; Homeland delicious; Cafe Queen; Habeeb's foods; Kobis foods; Manuel Hut; Cactus Lagos; Hot Lunch; Healthy Diets