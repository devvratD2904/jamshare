import { PrismaClient, TagCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const tags = [
        // Genres
        { name: "Pop", category: TagCategory.GENRE },
        { name: "Rock", category: TagCategory.GENRE },
        { name: "Hip-Hop", category: TagCategory.GENRE },
        { name: "Indie", category: TagCategory.GENRE },
        { name: "Electronic", category: TagCategory.GENRE },
        { name: "R&B", category: TagCategory.GENRE },
        { name: "K-Pop", category: TagCategory.GENRE },

        // Moods
        { name: "Chill", category: TagCategory.MOOD },
        { name: "Energetic", category: TagCategory.MOOD },
        { name: "Sad", category: TagCategory.MOOD },
        { name: "Happy", category: TagCategory.MOOD },
        { name: "Focus", category: TagCategory.MOOD },

        // Activities
        { name: "Party", category: TagCategory.ACTIVITY },
        { name: "Workout", category: TagCategory.ACTIVITY },
        { name: "Study", category: TagCategory.ACTIVITY },
        { name: "Drive", category: TagCategory.ACTIVITY },
        { name: "Gaming", category: TagCategory.ACTIVITY },

        // Eras
        { name: "90s", category: TagCategory.ERA },
        { name: "2000s", category: TagCategory.ERA },
        { name: "80s", category: TagCategory.ERA },
    ];

    console.log("Seeding tags...");

    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { name: tag.name },
            update: {},
            create: {
                name: tag.name,
                category: tag.category,
            },
        });
    }

    console.log("Seeding completed.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
