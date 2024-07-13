const { Client, GatewayIntentBits } = require("discord.js");
const dbPool = require("./db"); // Import MySQL connection pool
require("dotenv").config(); // Load environment variables from .env file

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const token = process.env.BOT_TOKEN; // Access token from environment variable

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
    try {
        if (message.content === "!test") {
            const userId = message.author.id;
            const itemName = "New Item"; // Replace with the item name you want to add
            const quantity = 1; // Replace with the quantity of the item

            // Insert item into itemInventory
            const insertItemQuery =
                "INSERT INTO itemInventory (user_id, item_name, quantity) VALUES (?, ?, ?)";
            const itemValues = [userId, itemName, quantity];
            await dbPool.promise().query(insertItemQuery, itemValues);

            console.log(
                `Item '${itemName}' added to inventory for user ${userId}.`,
            );
            message.reply(`Item '${itemName}' added to your inventory!`);
        }

        if (message.content === "/drip") {
            message.channel.send("otário");
        }

        if (message.content === "!start") {
            const userId = message.author.id;
            const username = message.author.username;

            // Insert a new user into the users table
            const insertUserQuery =
                "INSERT INTO users (discord_id, username) VALUES (?, ?)";
            const userValues = [userId, username];
            const [userResult] = await dbPool
                .promise()
                .query(insertUserQuery, userValues);
            const newUserId = userResult.insertId;

            // Insert initial records into itemInventory, charactersInventory, coinsInventory
            const initialItems = [
                [newUserId, "Sword", 1],
                [newUserId, "Potion", 5],
            ];

            const initialCharacters = [
                [newUserId, "Warrior", 10],
                [newUserId, "Mage", 8],
            ];

            const initialCoins = [[newUserId, 1000]];

            // Execute batch inserts using transactions
            await dbPool.getConnection(async (err, connection) => {
                if (err) throw err;

                try {
                    await connection.beginTransaction();

                    // Insert initial items
                    await Promise.all(
                        initialItems.map((item) =>
                            connection.query(insertItemQuery, item),
                        ),
                    );

                    // Insert initial characters
                    const insertCharactersQuery =
                        "INSERT INTO charactersInventory (user_id, character_name, level) VALUES (?, ?, ?)";
                    await Promise.all(
                        initialCharacters.map((character) =>
                            connection.query(insertCharactersQuery, character),
                        ),
                    );

                    // Insert initial coins
                    const insertCoinsQuery =
                        "INSERT INTO coinsInventory (user_id, coins_amount) VALUES (?, ?)";
                    await Promise.all(
                        initialCoins.map((coins) =>
                            connection.query(insertCoinsQuery, coins),
                        ),
                    );

                    await connection.commit();
                    console.log("User setup completed successfully.");
                    message.reply("Your game setup is complete!");
                } catch (error) {
                    await connection.rollback();
                    console.error("Error setting up user:", error);
                    message.reply(
                        "An error occurred during setup. Please try again later.",
                    );
                } finally {
                    connection.release();
                }
            });
        }

        if (message.content === "!ci") {
            // Fetch characters inventory for the user
            const selectCharactersQuery =
                "SELECT * FROM charactersInventory WHERE user_id = ?";
            const [charactersRows] = await dbPool
                .promise()
                .query(selectCharactersQuery, [message.author.id]);

            if (charactersRows.length > 0) {
                const charactersList = charactersRows
                    .map(
                        (character) =>
                            `${character.character_name} (Level ${character.level})`,
                    )
                    .join("\n");
                message.reply(`Your Characters Inventory:\n${charactersList}`);
            } else {
                message.reply("No characters found in your inventory.");
            }
        }

        if (message.content === "!ii") {
            // Fetch items inventory for the user
            const selectItemsQuery =
                "SELECT * FROM itemInventory WHERE user_id = ?";
            const [itemsRows] = await dbPool
                .promise()
                .query(selectItemsQuery, [message.author.id]);

            if (itemsRows.length > 0) {
                const itemsList = itemsRows
                    .map((item) => `${item.item_name} (${item.quantity})`)
                    .join("\n");
                message.reply(`Your Items Inventory:\n${itemsList}`);
            } else {
                message.reply("No items found in your inventory.");
            }
        }
    } catch (error) {
        console.error("Error processing message:", error);
        message.reply("An error occurred. Please try again later.");
    }
});

client.login(token);
