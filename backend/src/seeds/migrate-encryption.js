import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from '../models/message.model.js';
import { encrypt } from '../lib/encryption.js';

dotenv.config();

const migrate = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('Error: MONGODB_URI is not set in the environment.');
            process.exit(1);
        }

        console.log('Connecting to database...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        const messages = await Message.find({});
        console.log(`Found ${messages.length} total messages in the database.`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const message of messages) {
            if (!message.text) {
                skippedCount++;
                continue;
            }

            // Check if already encrypted
            const parts = message.text.split(':');
            const isEncrypted = parts.length === 2 && parts[0].length === 32 && /^[0-9a-fA-F]{32}$/.test(parts[0]);

            if (isEncrypted) {
                skippedCount++;
                continue;
            }

            // Encrypt and save
            const plainText = message.text;
            message.text = encrypt(plainText);
            await message.save();
            migratedCount++;
        }

        console.log(`Migration finished successfully.`);
        console.log(`Total migrated (encrypted): ${migratedCount}`);
        console.log(`Total skipped (already encrypted or empty): ${skippedCount}`);
    } catch (error) {
        console.error('Migration failed with error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};

migrate();
